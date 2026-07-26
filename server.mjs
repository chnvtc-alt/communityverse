import { createServer } from "node:http";
import { mkdirSync, readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import { join, normalize, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const projectRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const websiteRoot = resolve(projectRoot, "Website");
const dataDir = resolve(projectRoot, "data");
const dbPath = resolve(dataDir, "restaurant-challenge.sqlite");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    restaurant_name TEXT NOT NULL,
    restaurant_slug TEXT NOT NULL,
    is_guest INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    payload_json TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
  CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_slug ON profiles(restaurant_slug);

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    restaurant_slug TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON sessions(profile_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_completed_at ON sessions(completed_at);

  CREATE TABLE IF NOT EXISTS multiplayer_rooms (
    id TEXT PRIMARY KEY,
    room_code TEXT NOT NULL UNIQUE,
    restaurant_slug TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    question_ids TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    payload_json TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_code ON multiplayer_rooms(room_code);

  CREATE TABLE IF NOT EXISTS multiplayer_room_players (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    profile_id TEXT,
    session_id TEXT,
    display_name TEXT NOT NULL DEFAULT '',
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 10,
    result TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'in_progress',
    joined_at TEXT NOT NULL,
    completed_at TEXT,
    payload_json TEXT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES multiplayer_rooms(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_multiplayer_room_players_room_id ON multiplayer_room_players(room_id);

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    payload_json TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_questions_active_sort ON questions(active, sort_order, updated_at);
`);

const questionSeedPath = resolve(websiteRoot, "shared/restaurant-question-bank.json");

const emptyStats = () => ({
  gamesPlayed: 0,
  totalCorrectAnswers: 0,
  regularCustomers: 0,
  occasionalCustomers: 0,
  lostCustomers: 0,
  totalCustomerValue: 0,
  estimatedSales: 0,
});

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeProfile(profile) {
  const safeProfile = typeof profile === "object" && profile ? structuredClone(profile) : {};
  safeProfile.id = String(safeProfile.id || "");
  safeProfile.playerName = String(safeProfile.playerName || "").trim();
  safeProfile.restaurantName = String(safeProfile.restaurantName || "").trim();
  safeProfile.restaurantSlug = String(safeProfile.restaurantSlug || "").trim();
  safeProfile.createdAt = String(safeProfile.createdAt || nowIso());
  safeProfile.lastPlayedAt = String(safeProfile.lastPlayedAt || "");
  safeProfile.isGuest = Boolean(safeProfile.isGuest);
  safeProfile.stats = { ...emptyStats(), ...(safeProfile.stats || {}) };
  safeProfile.restaurantStats = safeProfile.restaurantStats && typeof safeProfile.restaurantStats === "object"
    ? safeProfile.restaurantStats
    : {};
  safeProfile.customerCollection = Array.isArray(safeProfile.customerCollection)
    ? safeProfile.customerCollection
    : [];
  safeProfile.recentSessions = Array.isArray(safeProfile.recentSessions)
    ? safeProfile.recentSessions
    : [];
  return safeProfile;
}

function getProfileRow(id) {
  const row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(id);
  if (!row) {
    return null;
  }

  return {
    ...safeJsonParse(row.payload_json, {}),
    id: row.id,
    playerName: row.player_name,
    restaurantName: row.restaurant_name,
    restaurantSlug: row.restaurant_slug,
    isGuest: Boolean(row.is_guest),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function upsertProfile(profile) {
  const normalized = normalizeProfile(profile);
  if (!normalized.id) {
    throw new Error("Profile id is required.");
  }

  const updatedAt = nowIso();
  db.prepare(`
    INSERT INTO profiles (
      id,
      player_name,
      restaurant_name,
      restaurant_slug,
      is_guest,
      created_at,
      updated_at,
      payload_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      player_name = excluded.player_name,
      restaurant_name = excluded.restaurant_name,
      restaurant_slug = excluded.restaurant_slug,
      is_guest = excluded.is_guest,
      updated_at = excluded.updated_at,
      payload_json = excluded.payload_json
  `).run(
    normalized.id,
    normalized.playerName || "Player",
    normalized.restaurantName || "Restaurant",
    normalized.restaurantSlug || "restaurant",
    normalized.isGuest ? 1 : 0,
    normalized.createdAt,
    updatedAt,
    JSON.stringify(normalized)
  );

  return {
    ...normalized,
    updatedAt,
  };
}

function saveSession(session) {
  const safeSession = typeof session === "object" && session ? structuredClone(session) : {};
  safeSession.id = String(safeSession.id || "");
  safeSession.profileId = String(safeSession.profileId || "");
  safeSession.restaurantSlug = String(safeSession.restaurantSlug || "");
  safeSession.completedAt = String(safeSession.completedAt || nowIso());

  if (!safeSession.id) {
    throw new Error("Session id is required.");
  }

  db.prepare(`
    INSERT INTO sessions (id, profile_id, restaurant_slug, completed_at, payload_json)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      profile_id = excluded.profile_id,
      restaurant_slug = excluded.restaurant_slug,
      completed_at = excluded.completed_at,
      payload_json = excluded.payload_json
  `).run(
    safeSession.id,
    safeSession.profileId,
    safeSession.restaurantSlug,
    safeSession.completedAt,
    JSON.stringify(safeSession)
  );

  return safeSession;
}

const ROOM_CODE_WORDS = [
  "ANCHOR",
  "BAKER",
  "BENGAL",
  "BISTRO",
  "BRAVO",
  "CEDAR",
  "COBALT",
  "COPPER",
  "DELTA",
  "DINER",
  "EMBER",
  "FABLE",
  "FIESTA",
  "GARDEN",
  "GINGER",
  "HARBOR",
  "HARVEST",
  "JAZZ",
  "JUNIPER",
  "KETTLE",
  "LANTERN",
  "MAPLE",
  "MARKET",
  "MEADOW",
  "NICKEL",
  "ORCHARD",
  "PEPPER",
  "PIONEER",
  "PLAZA",
  "ROCKET",
  "SADDLE",
  "SAFFRON",
  "SUNSET",
  "TAVERN",
  "TIGER",
  "VELVET",
  "VICTORY",
  "WALNUT",
  "WILLOW",
  "ZESTY",
];
const LIVE_QUESTION_SECONDS = 25;
const LIVE_REVIEW_SECONDS = 4;

function randomId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function randomRoomCode() {
  const bytes = new Uint8Array(2);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    bytes[0] = Math.floor(Math.random() * 255);
    bytes[1] = Math.floor(Math.random() * 255);
  }
  return `${ROOM_CODE_WORDS[bytes[0] % ROOM_CODE_WORDS.length]}-${ROOM_CODE_WORDS[bytes[1] % ROOM_CODE_WORDS.length]}`;
}

function normalizeRoomCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeQuestionIds(value) {
  return (Array.isArray(value) ? value : [])
    .map((questionId) => String(questionId || "").trim())
    .filter(Boolean)
    .slice(0, 10);
}

function roomIsClosed(room) {
  const expiresAt = Date.parse(room?.expiresAt || "");
  return room?.status === "closed" || Boolean(expiresAt && expiresAt <= Date.now());
}

function roomFromRow(row) {
  if (!row) {
    return null;
  }
  const payload = safeJsonParse(row.payload_json, {});
  const room = {
    ...payload,
    id: row.id,
    roomCode: row.room_code,
    restaurantSlug: row.restaurant_slug,
    customerId: row.customer_id,
    questionIds: normalizeQuestionIds(safeJsonParse(row.question_ids, payload.questionIds || [])),
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
  if (roomIsClosed(room)) {
    room.status = "closed";
  }
  return room;
}

function playerFromRow(row, room) {
  if (!row) {
    return null;
  }
  const payload = safeJsonParse(row.payload_json, {});
  const status = row.status || payload.status || "in_progress";
  return {
    ...payload,
    id: row.id,
    roomId: row.room_id,
    profileId: row.profile_id || "",
    sessionId: row.session_id || "",
    displayName: row.display_name || "Player",
    score: Number(row.score) || 0,
    totalQuestions: Number(row.total_questions) || 10,
    result: row.result || "",
    status: roomIsClosed(room) && status === "in_progress" ? "did_not_finish" : status,
    joinedAt: row.joined_at,
    completedAt: row.completed_at || "",
    answeredQuestionIndex: Number(payload.answeredQuestionIndex ?? -1),
    lastAnswerCorrect: Boolean(payload.lastAnswerCorrect),
    lastSelectedIndex: Number(payload.lastSelectedIndex ?? -1),
  };
}

function getRoomByCode(roomCode) {
  const row = db.prepare("SELECT * FROM multiplayer_rooms WHERE room_code = ?").get(normalizeRoomCode(roomCode));
  return roomFromRow(row);
}

function getRoomPlayers(room) {
  if (!room?.id) {
    return [];
  }
  return db
    .prepare("SELECT * FROM multiplayer_room_players WHERE room_id = ? ORDER BY score DESC, completed_at ASC, joined_at ASC")
    .all(room.id)
    .map((row) => playerFromRow(row, room))
    .filter(Boolean);
}

function getRoomState(roomCode) {
  const room = getRoomByCode(roomCode);
  if (!room) {
    return null;
  }
  return {
    room,
    players: getRoomPlayers(room),
  };
}

function saveRoom(room) {
  db.prepare(`
    INSERT INTO multiplayer_rooms (id, room_code, restaurant_slug, customer_id, question_ids, status, created_at, expires_at, payload_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      room_code = excluded.room_code,
      restaurant_slug = excluded.restaurant_slug,
      customer_id = excluded.customer_id,
      question_ids = excluded.question_ids,
      status = excluded.status,
      expires_at = excluded.expires_at,
      payload_json = excluded.payload_json
  `).run(
    room.id,
    room.roomCode,
    room.restaurantSlug,
    room.customerId,
    JSON.stringify(room.questionIds || []),
    room.status || "open",
    room.createdAt || nowIso(),
    room.expiresAt,
    JSON.stringify(room)
  );
  return getRoomByCode(room.roomCode) || room;
}

function createRoom(body) {
  const questionIds = normalizeQuestionIds(body?.questionIds);
  const restaurantSlug = String(body?.restaurantSlug || "").trim();
  const customerId = String(body?.customerId || "").trim();
  if (!restaurantSlug || !customerId || questionIds.length < 10) {
    throw new Error("A room needs a restaurant, character, and 10 questions.");
  }

  let roomCode = randomRoomCode();
  while (getRoomByCode(roomCode)) {
    roomCode = randomRoomCode();
  }
  const createdAt = nowIso();
  const room = {
    id: randomId("room"),
    roomCode,
    restaurantSlug,
    customerId,
    questionIds,
    status: "open",
    mode: body?.mode === "live" ? "live" : "casual",
    liveStatus: body?.mode === "live" ? "waiting" : "",
    currentQuestionIndex: body?.mode === "live" ? 0 : null,
    questionDurationSeconds: body?.mode === "live" ? LIVE_QUESTION_SECONDS : null,
    questionStartedAt: "",
    questionEndsAt: "",
    reviewStartedAt: "",
    reviewEndsAt: "",
    createdAt,
    expiresAt: new Date(Date.parse(createdAt) + 15 * 60 * 1000).toISOString(),
  };
  saveRoom(room);
  const joined = joinRoom(room.roomCode, {
    displayName: body?.hostName || body?.displayName || "Host",
    profileId: body?.profileId || "",
    sessionId: body?.sessionId || "",
    host: true,
  });
  return {
    ...joined,
    room,
  };
}

function joinRoom(roomCode, body) {
  const state = getRoomState(roomCode);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (roomIsClosed(state.room)) {
    throw new Error("This room is closed.");
  }
  const player = {
    id: randomId("room_player"),
    roomId: state.room.id,
    profileId: String(body?.profileId || ""),
    sessionId: String(body?.sessionId || ""),
    displayName: String(body?.displayName || body?.playerName || "Player").trim().slice(0, 40) || "Player",
    score: 0,
    totalQuestions: state.room.questionIds.length || 10,
    result: "",
    status: "in_progress",
    joinedAt: nowIso(),
    completedAt: "",
    host: Boolean(body?.host),
    answeredQuestionIndex: -1,
    lastAnswerCorrect: false,
    lastSelectedIndex: -1,
  };
  db.prepare(`
    INSERT INTO multiplayer_room_players (id, room_id, profile_id, session_id, display_name, score, total_questions, result, status, joined_at, completed_at, payload_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    player.id,
    player.roomId,
    player.profileId || null,
    player.sessionId || null,
    player.displayName,
    player.score,
    player.totalQuestions,
    player.result,
    player.status,
    player.joinedAt,
    null,
    JSON.stringify(player)
  );
  return {
    room: state.room,
    player,
    players: [...state.players, player],
  };
}

function finishRoomPlayer(roomCode, body) {
  const state = getRoomState(roomCode);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (roomIsClosed(state.room)) {
    throw new Error("This room is closed.");
  }
  const playerId = String(body?.playerId || "");
  const existing = state.players.find((player) => player.id === playerId);
  if (!existing) {
    throw new Error("Room player not found.");
  }
  const player = {
    ...existing,
    profileId: String(body?.profileId || existing.profileId || ""),
    sessionId: String(body?.sessionId || existing.sessionId || ""),
    score: Math.max(0, Number(body?.score) || 0),
    totalQuestions: Math.max(1, Number(body?.totalQuestions) || existing.totalQuestions || 10),
    result: String(body?.result || ""),
    status: "completed",
    completedAt: String(body?.completedAt || nowIso()),
    answeredQuestionIndex: Number.isFinite(Number(body?.answeredQuestionIndex))
      ? Number(body.answeredQuestionIndex)
      : Number(existing.answeredQuestionIndex ?? -1),
    lastAnswerCorrect: Boolean(body?.lastAnswerCorrect),
    lastSelectedIndex: Number.isFinite(Number(body?.lastSelectedIndex))
      ? Number(body.lastSelectedIndex)
      : Number(existing.lastSelectedIndex ?? -1),
  };
  db.prepare(`
    UPDATE multiplayer_room_players
    SET profile_id = ?, session_id = ?, score = ?, total_questions = ?, result = ?, status = ?, completed_at = ?, payload_json = ?
    WHERE id = ?
  `).run(
    player.profileId || null,
    player.sessionId || null,
    player.score,
    player.totalQuestions,
    player.result,
    player.status,
    player.completedAt,
    JSON.stringify(player),
    player.id
  );
  return {
    room: state.room,
    player,
    players: getRoomPlayers(state.room).map((item) => item.id === player.id ? player : item),
  };
}

function updateRoomPlayerProgress(roomCode, body) {
  const state = getRoomState(roomCode);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (roomIsClosed(state.room)) {
    throw new Error("This room is closed.");
  }
  const playerId = String(body?.playerId || "");
  const existing = state.players.find((player) => player.id === playerId);
  if (!existing) {
    throw new Error("Room player not found.");
  }
  const player = {
    ...existing,
    profileId: String(body?.profileId || existing.profileId || ""),
    sessionId: String(body?.sessionId || existing.sessionId || ""),
    score: Math.max(0, Number(body?.score) || 0),
    totalQuestions: Math.max(1, Number(body?.totalQuestions) || existing.totalQuestions || 10),
    result: String(body?.result || existing.result || ""),
    status: body?.status === "completed" ? "completed" : "in_progress",
    completedAt: body?.status === "completed" ? String(body?.completedAt || nowIso()) : "",
    answeredQuestionIndex: Number.isFinite(Number(body?.answeredQuestionIndex))
      ? Number(body.answeredQuestionIndex)
      : Number(existing.answeredQuestionIndex ?? -1),
    lastAnswerCorrect: Boolean(body?.lastAnswerCorrect),
    lastSelectedIndex: Number.isFinite(Number(body?.lastSelectedIndex))
      ? Number(body.lastSelectedIndex)
      : Number(existing.lastSelectedIndex ?? -1),
  };
  db.prepare(`
    UPDATE multiplayer_room_players
    SET profile_id = ?, session_id = ?, score = ?, total_questions = ?, result = ?, status = ?, completed_at = ?, payload_json = ?
    WHERE id = ?
  `).run(
    player.profileId || null,
    player.sessionId || null,
    player.score,
    player.totalQuestions,
    player.result,
    player.status,
    player.completedAt || null,
    JSON.stringify(player),
    player.id
  );
  return {
    room: state.room,
    player,
    players: getRoomPlayers(state.room).map((item) => item.id === player.id ? player : item),
  };
}

function startLiveRoom(roomCode) {
  const state = getRoomState(roomCode);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (roomIsClosed(state.room)) {
    throw new Error("This room is closed.");
  }
  if (state.room.mode !== "live") {
    throw new Error("This is not a live round room.");
  }
  const startedAt = nowIso();
  const duration = Number(state.room.questionDurationSeconds) || LIVE_QUESTION_SECONDS;
  const room = saveRoom({
    ...state.room,
    liveStatus: "active",
    currentQuestionIndex: 0,
    questionDurationSeconds: duration,
    questionStartedAt: startedAt,
    questionEndsAt: new Date(Date.parse(startedAt) + duration * 1000).toISOString(),
    reviewStartedAt: "",
    reviewEndsAt: "",
  });
  return {
    room,
    players: getRoomPlayers(room),
  };
}

function advanceLiveRoom(roomCode) {
  const state = getRoomState(roomCode);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (roomIsClosed(state.room) || state.room.mode !== "live" || !["active", "review"].includes(state.room.liveStatus)) {
    return state;
  }
  const currentIndex = Math.max(0, Number(state.room.currentQuestionIndex) || 0);
  if (state.room.liveStatus === "active") {
    const reviewStartedAt = nowIso();
    const room = saveRoom({
      ...state.room,
      liveStatus: "review",
      questionStartedAt: "",
      questionEndsAt: "",
      reviewStartedAt,
      reviewEndsAt: new Date(Date.parse(reviewStartedAt) + LIVE_REVIEW_SECONDS * 1000).toISOString(),
    });
    return {
      room,
      players: getRoomPlayers(room),
    };
  }
  const nextIndex = currentIndex + 1;
  const totalQuestions = normalizeQuestionIds(state.room.questionIds).length || 10;
  if (nextIndex >= totalQuestions) {
    const room = saveRoom({
      ...state.room,
      liveStatus: "completed",
      currentQuestionIndex: totalQuestions,
      questionStartedAt: "",
      questionEndsAt: "",
      reviewStartedAt: "",
      reviewEndsAt: "",
    });
    return {
      room,
      players: getRoomPlayers(room),
    };
  }
  const startedAt = nowIso();
  const duration = Number(state.room.questionDurationSeconds) || LIVE_QUESTION_SECONDS;
  const room = saveRoom({
    ...state.room,
    liveStatus: "active",
    currentQuestionIndex: nextIndex,
    questionStartedAt: startedAt,
    questionEndsAt: new Date(Date.parse(startedAt) + duration * 1000).toISOString(),
    reviewStartedAt: "",
    reviewEndsAt: "",
  });
  return {
    room,
    players: getRoomPlayers(room),
  };
}

function questionFromRow(row) {
  if (!row) {
    return null;
  }

  return {
    ...safeJsonParse(row.payload_json, {}),
    id: row.id,
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function loadQuestionSeed() {
  try {
    const raw = readFileSync(questionSeedPath, "utf8");
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function seedQuestionsIfNeeded() {
  const counts = db.prepare("SELECT COUNT(*) AS count FROM questions").get();
  if (Number(counts?.count) > 0) {
    return;
  }

  const seed = loadQuestionSeed();
  if (!seed.length) {
    return;
  }

  const insert = db.prepare(`
    INSERT OR REPLACE INTO questions (
      id,
      active,
      sort_order,
      created_at,
      updated_at,
      payload_json
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const timestamp = nowIso();
  db.exec("BEGIN");
  try {
    seed.forEach((question, index) => {
      const normalized = typeof question === "object" && question ? structuredClone(question) : {};
      const payload = JSON.stringify(normalized);
      insert.run(
        String(normalized.id || `question-${index}`),
        normalized.active === false ? 0 : 1,
        Number.isFinite(Number(normalized.sortOrder)) ? Number(normalized.sortOrder) : index,
        String(normalized.createdAt || timestamp),
        String(normalized.updatedAt || timestamp),
        payload
      );
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function getQuestions() {
  const rows = db
    .prepare("SELECT * FROM questions WHERE active = 1 ORDER BY sort_order ASC, updated_at ASC")
    .all();

  return rows.map(questionFromRow).filter(Boolean);
}

seedQuestionsIfNeeded();

function buildStats(profile, restaurantSlug = "") {
  const base = restaurantSlug
    ? normalizeProfile(profile).restaurantStats?.[restaurantSlug] || emptyStats()
    : normalizeProfile(profile).stats || emptyStats();

  return {
    gamesPlayed: Number(base.gamesPlayed) || 0,
    totalCorrectAnswers: Number(base.totalCorrectAnswers) || 0,
    regularCustomers: Number(base.regularCustomers) || 0,
    occasionalCustomers: Number(base.occasionalCustomers) || 0,
    lostCustomers: Number(base.lostCustomers) || 0,
    totalCustomerValue: Number(base.totalCustomerValue) || 0,
    estimatedSales: Number(base.estimatedSales) || 0,
  };
}

function leaderboardValue(stats, metric) {
  const accuracy = stats.gamesPlayed ? (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100 : 0;

  if (metric === "rating") {
    return accuracy / 20;
  }

  if (metric === "accuracy") {
    return accuracy;
  }

  if (metric === "gamesPlayed") {
    return stats.gamesPlayed;
  }

  if (metric === "regularCustomers") {
    return stats.regularCustomers;
  }

  if (metric === "collected") {
    return stats.regularCustomers + stats.occasionalCustomers;
  }

  return stats.estimatedSales;
}

function getLeaderboard(metric = "estimatedSales", restaurantSlug = "") {
  const rows = db.prepare("SELECT payload_json FROM profiles").all();

  return rows
    .map((row) => normalizeProfile(safeJsonParse(row.payload_json, {})))
    .filter((profile) => !profile.isGuest)
    .map((profile) => {
      const stats = buildStats(profile, restaurantSlug);
      const accuracy = stats.gamesPlayed ? (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100 : 0;
      const value = leaderboardValue(stats, metric);
      return {
        profileId: profile.id,
        playerName: profile.playerName,
        restaurantName: profile.restaurantName,
        stats,
        accuracy,
        rating: accuracy / 20,
        value,
      };
    })
    .filter((entry) => restaurantSlug ? entry.stats.gamesPlayed > 0 : true)
    .sort((left, right) => {
      if (right.value !== left.value) {
        return right.value - left.value;
      }

      return left.playerName.localeCompare(right.playerName);
    })
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return null;
  }

  return safeJsonParse(raw, null);
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  response.end(body);
}

function contentTypeFor(filePath) {
  const ext = extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

function sendNotFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}

async function serveStatic(request, response, pathname) {
  let resolvedPath = normalize(decodeURIComponent(pathname));
  if (resolvedPath.startsWith("..")) {
    sendNotFound(response);
    return;
  }

  if (resolvedPath === "/" || resolvedPath === "") {
    resolvedPath = "/index.html";
  }

  const directPath = resolve(websiteRoot, `.${resolvedPath}`);
  let filePath = directPath;

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = join(filePath, "index.html");
    }
  } catch {
    if (!extname(filePath)) {
      filePath = join(filePath, "index.html");
    }
  }

  try {
    const finalStat = await stat(filePath);
    if (finalStat.isDirectory()) {
      filePath = join(filePath, "index.html");
    }

    const body = readFileSync(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypeFor(filePath),
      "Content-Length": body.length,
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch {
    sendNotFound(response);
  }
}

async function handleApi(request, response, url) {
  const { pathname, searchParams } = url;

  if (request.method === "GET" && pathname === "/api/health") {
    const counts = db.prepare("SELECT COUNT(*) AS count FROM profiles").get();
    sendJson(response, 200, { ok: true, profiles: counts.count });
    return;
  }

  if (request.method === "GET" && pathname === "/api/profiles") {
    const rows = db.prepare("SELECT payload_json FROM profiles ORDER BY updated_at DESC").all();
    sendJson(
      response,
      200,
      rows.map((row) => normalizeProfile(safeJsonParse(row.payload_json, {})))
    );
    return;
  }

  if (request.method === "GET" && pathname.startsWith("/api/profiles/")) {
    const id = decodeURIComponent(pathname.slice("/api/profiles/".length));
    const profile = getProfileRow(id);
    if (!profile) {
      sendNotFound(response);
      return;
    }

    sendJson(response, 200, profile);
    return;
  }

  if (request.method === "PUT" && pathname.startsWith("/api/profiles/")) {
    const id = decodeURIComponent(pathname.slice("/api/profiles/".length));
    const body = await readBody(request);
    const payload = body && typeof body === "object" ? { ...body, id } : { id };
    const saved = upsertProfile(payload);
    sendJson(response, 200, saved);
    return;
  }

  if (request.method === "POST" && pathname === "/api/profiles") {
    const body = await readBody(request);
    if (!body || typeof body !== "object") {
      sendJson(response, 400, { ok: false, error: "Expected a JSON profile object." });
      return;
    }

    const saved = upsertProfile(body);
    sendJson(response, 201, saved);
    return;
  }

  if (request.method === "POST" && pathname === "/api/sessions") {
    const body = await readBody(request);
    if (!body || typeof body !== "object") {
      sendJson(response, 400, { ok: false, error: "Expected a JSON session object." });
      return;
    }

    const saved = saveSession(body);
    sendJson(response, 201, saved);
    return;
  }

  if (request.method === "GET" && pathname === "/api/sessions") {
    const profileId = String(searchParams.get("profileId") || "").trim();
    const rows = profileId
      ? db.prepare("SELECT payload_json FROM sessions WHERE profile_id = ? ORDER BY completed_at DESC").all(profileId)
      : db.prepare("SELECT payload_json FROM sessions ORDER BY completed_at DESC").all();

    sendJson(
      response,
      200,
      rows.map((row) => safeJsonParse(row.payload_json, {}))
    );
    return;
  }

  if (request.method === "GET" && pathname === "/api/questions") {
    sendJson(response, 200, getQuestions());
    return;
  }

  if (request.method === "GET" && pathname === "/api/leaderboard") {
    const metric = String(searchParams.get("metric") || "estimatedSales");
    const restaurantSlug = String(searchParams.get("restaurantSlug") || "");
    sendJson(response, 200, getLeaderboard(metric, restaurantSlug));
    return;
  }

  if (request.method === "POST" && pathname === "/api/multiplayer/rooms") {
    try {
      const body = await readBody(request);
      sendJson(response, 201, { ok: true, ...createRoom(body || {}) });
    } catch (error) {
      sendJson(response, 400, { ok: false, error: String(error?.message || error) });
    }
    return;
  }

  if (pathname.startsWith("/api/multiplayer/rooms/")) {
    const roomCode = decodeURIComponent(pathname.slice("/api/multiplayer/rooms/".length));
    if (request.method === "GET") {
      const state = getRoomState(roomCode);
      if (!state) {
        sendJson(response, 404, { ok: false, error: "Room not found." });
        return;
      }
      sendJson(response, 200, { ok: true, ...state });
      return;
    }
    if (request.method === "POST") {
      try {
        const body = await readBody(request);
        if (body?.action === "finish") {
          sendJson(response, 200, { ok: true, ...finishRoomPlayer(roomCode, body) });
          return;
        }
        if (body?.action === "progress") {
          sendJson(response, 200, { ok: true, ...updateRoomPlayerProgress(roomCode, body) });
          return;
        }
        if (body?.action === "start-live") {
          sendJson(response, 200, { ok: true, ...startLiveRoom(roomCode) });
          return;
        }
        if (body?.action === "advance-live") {
          sendJson(response, 200, { ok: true, ...advanceLiveRoom(roomCode) });
          return;
        }
        if (body?.action === "join") {
          sendJson(response, 201, { ok: true, ...joinRoom(roomCode, body) });
          return;
        }
        sendJson(response, 400, { ok: false, error: "Unknown room action." });
      } catch (error) {
        sendJson(response, 400, { ok: false, error: String(error?.message || error) });
      }
      return;
    }
  }

  sendNotFound(response);
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (requestUrl.pathname.startsWith("/api/")) {
      await handleApi(request, response, requestUrl);
      return;
    }

    if (requestUrl.pathname === "/restaurant") {
      response.writeHead(302, { Location: "/restaurant/" });
      response.end();
      return;
    }

    if (requestUrl.pathname === "/americana") {
      response.writeHead(302, { Location: "/americana/" });
      response.end();
      return;
    }

    if (requestUrl.pathname === "/cinematavern" || requestUrl.pathname === "/cinematavern/") {
      response.writeHead(301, { Location: requestUrl.pathname.endsWith("/") ? "/cinema-tavern/" : "/cinema-tavern" });
      response.end();
      return;
    }

    if (requestUrl.pathname === "/cinematavern/play" || requestUrl.pathname === "/cinematavern/play/") {
      response.writeHead(301, { Location: requestUrl.pathname.endsWith("/") ? "/cinema-tavern/play/" : "/cinema-tavern/play" });
      response.end();
      return;
    }

    const routeParts = requestUrl.pathname.split("/").filter(Boolean);
    const reservedTopLevelRoutes = new Set([
      "admin",
      "americana",
      "api",
      "assets",
      "cm-pepperville",
      "cm-pepperville-game.html",
      "empty-suit",
      "feedback",
      "index.html",
      "privacy",
      "restaurant",
      "shared",
      "south-of-the-smokies",
      "terms",
      "world-tour",
      "world-tour-game.html",
      "zoo",
      "zoo-game.html",
    ]);
    if (routeParts.length === 2 && routeParts[1] === "play" && !reservedTopLevelRoutes.has(routeParts[0])) {
      await serveStatic(request, response, "/americana/play/");
      return;
    }
    if (routeParts.length === 1 && !reservedTopLevelRoutes.has(routeParts[0])) {
      await serveStatic(request, response, "/americana/");
      return;
    }

    await serveStatic(request, response, requestUrl.pathname);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
  }
});

server.listen(port, host, () => {
  console.log(`CommunityVerse server running at http://${host}:${port}`);
  console.log(`Website root: ${websiteRoot}`);
  console.log(`SQLite database: ${dbPath}`);
});
