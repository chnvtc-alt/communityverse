import { supabaseRequest } from "./supabase.mjs";

const ROOM_DURATION_MINUTES = 15;
const SERIES_ROOM_DURATION_MINUTES = 60;
const SERIES_TOTAL_GAMES = 3;
const LIVE_QUESTION_SECONDS = 25;
const LIVE_REVIEW_SECONDS = 4;
const ROOM_CODE_WORDS = [
  "ANCHOR",
  "BAKER",
  "BURGER",
  "BISTRO",
  "BRAVO",
  "LEMON",
  "COOKIE",
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
  "TABLE",
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
  "SALAD",
  "SUNSET",
  "TAVERN",
  "TIGER",
  "VELVET",
  "VICTORY",
  "WALNUT",
  "WILLOW",
  "ZESTY",
];

function nowIso() {
  return new Date().toISOString();
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
}

function randomString(prefix = "id") {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function generateRoomCode() {
  const bytes = new Uint8Array(2);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    bytes[0] = Math.floor(Math.random() * 255);
    bytes[1] = Math.floor(Math.random() * 255);
  }
  return `${ROOM_CODE_WORDS[bytes[0] % ROOM_CODE_WORDS.length]}-${ROOM_CODE_WORDS[bytes[1] % ROOM_CODE_WORDS.length]}`;
}

function normalizeQuestionIds(value) {
  return (Array.isArray(value) ? value : [])
    .map((questionId) => String(questionId || "").trim())
    .filter(Boolean)
    .slice(0, 10);
}

function normalizeSeriesGameNumber(value) {
  const number = Math.max(1, Number(value) || 1);
  return Math.min(SERIES_TOTAL_GAMES, Math.floor(number));
}

function normalizeSeriesScores(value) {
  const rawScores = Array.isArray(value) ? value : [];
  return Array.from({ length: SERIES_TOTAL_GAMES }, (_, index) =>
    Math.max(0, Number(rawScores[index]) || 0)
  );
}

function playerSeriesTotal(player) {
  return normalizeSeriesScores(player?.seriesScores).reduce((total, score) => total + score, 0);
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function roomFromRecord(record) {
  if (!record) {
    return null;
  }
  const payload = record.payload_json && typeof record.payload_json === "object" ? record.payload_json : {};
  return {
    ...payload,
    id: record.id ?? payload.id,
    roomCode: record.room_code ?? payload.roomCode,
    restaurantSlug: record.restaurant_slug ?? payload.restaurantSlug,
    customerId: record.customer_id ?? payload.customerId,
    questionIds: Array.isArray(record.question_ids) ? record.question_ids : normalizeQuestionIds(payload.questionIds),
    status: record.status ?? payload.status ?? "open",
    createdAt: record.created_at ?? payload.createdAt,
    expiresAt: record.expires_at ?? payload.expiresAt,
  };
}

function playerFromRecord(record, room = null) {
  if (!record) {
    return null;
  }
  const payload = record.payload_json && typeof record.payload_json === "object" ? record.payload_json : {};
  const status = record.status ?? payload.status ?? "in_progress";
  const isExpired = room && roomIsExpired(room);
  return {
    ...payload,
    id: record.id ?? payload.id,
    roomId: record.room_id ?? payload.roomId,
    profileId: record.profile_id ?? payload.profileId ?? "",
    sessionId: record.session_id ?? payload.sessionId ?? "",
    displayName: record.display_name ?? payload.displayName ?? "Player",
    score: Number(record.score ?? payload.score) || 0,
    totalQuestions: Number(record.total_questions ?? payload.totalQuestions) || 10,
    result: record.result ?? payload.result ?? "",
    status: isExpired && status === "in_progress" ? "did_not_finish" : status,
    joinedAt: record.joined_at ?? payload.joinedAt,
    completedAt: record.completed_at ?? payload.completedAt ?? "",
    answeredQuestionIndex: Number(payload.answeredQuestionIndex ?? -1),
    lastAnswerCorrect: Boolean(payload.lastAnswerCorrect),
    lastSelectedIndex: Number(payload.lastSelectedIndex ?? -1),
    seriesScores: normalizeSeriesScores(payload.seriesScores),
    seriesTotalScore: Math.max(0, Number(payload.seriesTotalScore) || playerSeriesTotal(payload)),
    seriesCompletedGames: Math.max(0, Number(payload.seriesCompletedGames) || 0),
  };
}

export function roomIsExpired(room) {
  const expiresAt = Date.parse(room?.expiresAt || "");
  return Boolean(expiresAt && expiresAt <= Date.now());
}

function roomStatus(room) {
  if (!room) {
    return "closed";
  }
  if (room.status === "closed" || roomIsExpired(room)) {
    return "closed";
  }
  return "open";
}

function roomToRecord(room) {
  const payload = {
    ...room,
    roomCode: normalizeCode(room.roomCode),
    restaurantSlug: String(room.restaurantSlug || "").trim(),
    customerId: String(room.customerId || "").trim(),
    questionIds: normalizeQuestionIds(room.questionIds),
    status: room.status || "open",
    createdAt: room.createdAt || nowIso(),
    expiresAt: room.expiresAt,
  };
  return {
    id: payload.id,
    room_code: payload.roomCode,
    restaurant_slug: payload.restaurantSlug,
    customer_id: payload.customerId,
    question_ids: payload.questionIds,
    status: payload.status,
    created_at: payload.createdAt,
    expires_at: payload.expiresAt,
    payload_json: payload,
  };
}

async function saveRoom(room) {
  const rows = await supabaseRequest("multiplayer_rooms?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([roomToRecord(room)]),
  });
  return Array.isArray(rows) && rows.length ? roomFromRecord(rows[0]) : room;
}

function playerToRecord(player) {
  const payload = {
    ...player,
    roomId: String(player.roomId || "").trim(),
    profileId: String(player.profileId || "").trim(),
    sessionId: String(player.sessionId || "").trim(),
    displayName: String(player.displayName || "Player").trim().slice(0, 40) || "Player",
    score: Math.max(0, Number(player.score) || 0),
    totalQuestions: Math.max(1, Number(player.totalQuestions) || 10),
    result: String(player.result || "").trim(),
    status: String(player.status || "in_progress").trim(),
    joinedAt: player.joinedAt || nowIso(),
    completedAt: String(player.completedAt || "").trim() || null,
    answeredQuestionIndex: Number.isFinite(Number(player.answeredQuestionIndex)) ? Number(player.answeredQuestionIndex) : -1,
    lastAnswerCorrect: Boolean(player.lastAnswerCorrect),
    lastSelectedIndex: Number.isFinite(Number(player.lastSelectedIndex)) ? Number(player.lastSelectedIndex) : -1,
    seriesScores: normalizeSeriesScores(player.seriesScores),
    seriesCompletedGames: Math.max(0, Number(player.seriesCompletedGames) || 0),
  };
  payload.seriesTotalScore = playerSeriesTotal(payload);
  return {
    id: payload.id,
    room_id: payload.roomId,
    profile_id: payload.profileId || null,
    session_id: payload.sessionId || null,
    display_name: payload.displayName,
    score: payload.score,
    total_questions: payload.totalQuestions,
    result: payload.result,
    status: payload.status,
    joined_at: payload.joinedAt,
    completed_at: payload.completedAt,
    payload_json: payload,
  };
}

async function fetchRoomByCode(code) {
  const safeCode = normalizeCode(code);
  if (!safeCode) {
    return null;
  }
  const rows = await supabaseRequest(
    `multiplayer_rooms?select=id,room_code,restaurant_slug,customer_id,question_ids,status,created_at,expires_at,payload_json&room_code=eq.${encodeURIComponent(safeCode)}&limit=1`
  );
  return Array.isArray(rows) && rows.length ? roomFromRecord(rows[0]) : null;
}

async function fetchPlayersForRoom(roomId, room = null) {
  if (!roomId) {
    return [];
  }
  const rows = await supabaseRequest(
    `multiplayer_room_players?select=id,room_id,profile_id,session_id,display_name,score,total_questions,result,status,joined_at,completed_at,payload_json&room_id=eq.${encodeURIComponent(roomId)}&order=score.desc,completed_at.asc,joined_at.asc`
  );
  return Array.isArray(rows) ? rows.map((record) => playerFromRecord(record, room)).filter(Boolean) : [];
}

async function createUniqueRoomCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const roomCode = generateRoomCode();
    const existing = await fetchRoomByCode(roomCode);
    if (!existing) {
      return roomCode;
    }
  }
  throw new Error("Unable to create a room code. Please try again.");
}

export async function createRoom(body = {}) {
  const restaurantSlug = String(body.restaurantSlug || "").trim();
  const customerId = String(body.customerId || "").trim();
  const questionIds = normalizeQuestionIds(body.questionIds);
  if (!restaurantSlug || !customerId || questionIds.length < 10) {
    throw new Error("A room needs a restaurant, character, and 10 questions.");
  }

  const createdAt = nowIso();
  const seriesMode = body.seriesMode === "three-game" ? "three-game" : "";
  const room = {
    id: randomString("room"),
    roomCode: await createUniqueRoomCode(),
    restaurantSlug,
    customerId,
    questionIds,
    status: "open",
    mode: body.mode === "live" ? "live" : "casual",
    seriesMode,
    seriesTotalGames: seriesMode ? SERIES_TOTAL_GAMES : 1,
    currentSeriesGame: 1,
    liveStatus: body.mode === "live" ? "waiting" : "",
    currentQuestionIndex: body.mode === "live" ? 0 : null,
    questionDurationSeconds: body.mode === "live" ? LIVE_QUESTION_SECONDS : null,
    questionStartedAt: "",
    questionEndsAt: "",
    reviewStartedAt: "",
    reviewEndsAt: "",
    createdAt,
    expiresAt: addMinutes(new Date(createdAt), seriesMode ? SERIES_ROOM_DURATION_MINUTES : ROOM_DURATION_MINUTES),
  };

  const savedRoom = await saveRoom(room);
  const player = await joinRoom(savedRoom.roomCode, {
    displayName: body.hostName || body.displayName || "Host",
    profileId: body.profileId || "",
    sessionId: body.sessionId || "",
    host: true,
  });
  return {
    ...player,
    room: savedRoom,
  };
}

export async function getRoomState(code) {
  const room = await fetchRoomByCode(code);
  if (!room) {
    return null;
  }
  const players = await fetchPlayersForRoom(room.id, room);
  return {
    room: {
      ...room,
      status: roomStatus(room),
    },
    players,
  };
}

export async function joinRoom(code, body = {}) {
  const state = await getRoomState(code);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (state.room.status !== "open") {
    throw new Error("This room is closed.");
  }

  const player = {
    id: randomString("room_player"),
    roomId: state.room.id,
    profileId: body.profileId || "",
    sessionId: body.sessionId || "",
    displayName: body.displayName || body.playerName || "Player",
    score: 0,
    totalQuestions: state.room.questionIds.length || 10,
    result: "",
    status: "in_progress",
    joinedAt: nowIso(),
    completedAt: "",
    host: Boolean(body.host),
    seriesScores: normalizeSeriesScores([]),
    seriesTotalScore: 0,
    seriesCompletedGames: 0,
  };

  const rows = await supabaseRequest("multiplayer_room_players?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([playerToRecord(player)]),
  });

  return {
    room: state.room,
    player: Array.isArray(rows) && rows.length ? playerFromRecord(rows[0], state.room) : player,
    players: [...state.players, player],
  };
}

async function savePlayers(players = []) {
  const records = (Array.isArray(players) ? players : []).map(playerToRecord);
  if (!records.length) {
    return [];
  }
  const rows = await supabaseRequest("multiplayer_room_players?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(records),
  });
  return Array.isArray(rows) ? rows : [];
}

export async function startLiveRoom(code) {
  const state = await getRoomState(code);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (state.room.status !== "open") {
    throw new Error("This room is closed.");
  }
  if (state.room.mode !== "live") {
    throw new Error("This is not a live round room.");
  }
  const startedAt = nowIso();
  const room = await saveRoom({
    ...state.room,
    liveStatus: "active",
    currentQuestionIndex: 0,
    questionDurationSeconds: Number(state.room.questionDurationSeconds) || LIVE_QUESTION_SECONDS,
    questionStartedAt: startedAt,
    questionEndsAt: addMinutes(new Date(startedAt), (Number(state.room.questionDurationSeconds) || LIVE_QUESTION_SECONDS) / 60),
    reviewStartedAt: "",
    reviewEndsAt: "",
  });
  return {
    room: {
      ...room,
      status: roomStatus(room),
    },
    players: await fetchPlayersForRoom(room.id, room),
  };
}

export async function advanceLiveRoom(code, options = {}) {
  const state = await getRoomState(code);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (state.room.status !== "open") {
    throw new Error("This room is closed.");
  }
  if (state.room.mode !== "live" || !["active", "review"].includes(state.room.liveStatus)) {
    return state;
  }
  const currentIndex = Math.max(0, Number(state.room.currentQuestionIndex) || 0);
  const expectedLiveStatus = String(options.expectedLiveStatus || "").trim();
  const expectedQuestionIndex = Number(options.expectedQuestionIndex);
  if (
    expectedLiveStatus &&
    (expectedLiveStatus !== state.room.liveStatus ||
      (Number.isFinite(expectedQuestionIndex) && expectedQuestionIndex !== currentIndex))
  ) {
    return state;
  }
  if (state.room.liveStatus === "active") {
    const reviewStartedAt = nowIso();
    const room = await saveRoom({
      ...state.room,
      liveStatus: "review",
      questionStartedAt: "",
      questionEndsAt: "",
      reviewStartedAt,
      reviewEndsAt: addMinutes(new Date(reviewStartedAt), LIVE_REVIEW_SECONDS / 60),
    });
    return {
      room: {
        ...room,
        status: roomStatus(room),
      },
      players: await fetchPlayersForRoom(room.id, room),
    };
  }
  const reviewEndsAt = Date.parse(state.room.reviewEndsAt || "");
  if (reviewEndsAt && reviewEndsAt > Date.now()) {
    return state;
  }
  const nextIndex = currentIndex + 1;
  const totalQuestions = normalizeQuestionIds(state.room.questionIds).length || 10;
  if (nextIndex >= totalQuestions) {
    const room = await saveRoom({
      ...state.room,
      liveStatus: "completed",
      currentQuestionIndex: totalQuestions,
      questionStartedAt: "",
      questionEndsAt: "",
      reviewStartedAt: "",
      reviewEndsAt: "",
    });
    return {
      room: {
        ...room,
        status: roomStatus(room),
      },
      players: await fetchPlayersForRoom(room.id, room),
    };
  }
  const startedAt = nowIso();
  const room = await saveRoom({
    ...state.room,
    currentQuestionIndex: nextIndex,
    liveStatus: "active",
    questionStartedAt: startedAt,
    questionEndsAt: addMinutes(new Date(startedAt), (Number(state.room.questionDurationSeconds) || LIVE_QUESTION_SECONDS) / 60),
    reviewStartedAt: "",
    reviewEndsAt: "",
  });
  return {
    room: {
      ...room,
      status: roomStatus(room),
    },
    players: await fetchPlayersForRoom(room.id, room),
  };
}

export async function prepareNextSeriesGame(code, body = {}) {
  const state = await getRoomState(code);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (state.room.status !== "open") {
    throw new Error("This room is closed.");
  }
  if (state.room.mode !== "live" || state.room.seriesMode !== "three-game") {
    throw new Error("This is not a 3-game series room.");
  }
  const currentSeriesGame = normalizeSeriesGameNumber(state.room.currentSeriesGame);
  if (currentSeriesGame >= SERIES_TOTAL_GAMES) {
    throw new Error("This series is already on the final game.");
  }
  const customerId = String(body.customerId || "").trim();
  const questionIds = normalizeQuestionIds(body.questionIds);
  if (!customerId || questionIds.length < 10) {
    throw new Error("The next series game needs a character and 10 questions.");
  }

  const nextSeriesGame = currentSeriesGame + 1;
  const room = await saveRoom({
    ...state.room,
    customerId,
    questionIds,
    currentSeriesGame: nextSeriesGame,
    liveStatus: "waiting",
    currentQuestionIndex: 0,
    questionStartedAt: "",
    questionEndsAt: "",
    reviewStartedAt: "",
    reviewEndsAt: "",
  });
  const resetPlayers = state.players.map((player) => ({
    ...player,
    sessionId: "",
    score: 0,
    totalQuestions: questionIds.length || 10,
    result: "",
    status: "in_progress",
    completedAt: "",
    answeredQuestionIndex: -1,
    lastAnswerCorrect: false,
    lastSelectedIndex: -1,
  }));
  await savePlayers(resetPlayers);
  return {
    room: {
      ...room,
      status: roomStatus(room),
    },
    players: await fetchPlayersForRoom(room.id, room),
  };
}

export async function updateRoomPlayerProgress(code, body = {}) {
  const state = await getRoomState(code);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (roomIsExpired(state.room)) {
    throw new Error("This room is closed.");
  }
  const playerId = String(body.playerId || "").trim();
  const player = state.players.find((item) => item.id === playerId);
  if (!player) {
    throw new Error("Room player not found.");
  }
  const updatedPlayer = {
    ...player,
    profileId: body.profileId || player.profileId,
    sessionId: body.sessionId || player.sessionId,
    score: Math.max(0, Number(body.score) || 0),
    totalQuestions: Math.max(1, Number(body.totalQuestions) || player.totalQuestions || 10),
    result: String(body.result || player.result || "").trim(),
    status: body.status === "completed" ? "completed" : "in_progress",
    completedAt: body.status === "completed" ? body.completedAt || nowIso() : "",
    answeredQuestionIndex: Number.isFinite(Number(body.answeredQuestionIndex))
      ? Number(body.answeredQuestionIndex)
      : Number(player.answeredQuestionIndex ?? -1),
    lastAnswerCorrect: Boolean(body.lastAnswerCorrect),
    lastSelectedIndex: Number.isFinite(Number(body.lastSelectedIndex))
      ? Number(body.lastSelectedIndex)
      : Number(player.lastSelectedIndex ?? -1),
  };

  const rows = await supabaseRequest("multiplayer_room_players?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([playerToRecord(updatedPlayer)]),
  });
  return {
    room: state.room,
    player: Array.isArray(rows) && rows.length ? playerFromRecord(rows[0], state.room) : updatedPlayer,
    players: (await getRoomState(code))?.players || [],
  };
}

export async function finishRoomPlayer(code, body = {}) {
  const state = await getRoomState(code);
  if (!state?.room) {
    throw new Error("Room not found.");
  }
  if (roomIsExpired(state.room)) {
    throw new Error("This room is closed.");
  }
  const playerId = String(body.playerId || "").trim();
  const player = state.players.find((item) => item.id === playerId);
  if (!player) {
    throw new Error("Room player not found.");
  }

  const finishedPlayer = {
    ...player,
    profileId: body.profileId || player.profileId,
    sessionId: body.sessionId || player.sessionId,
    score: Math.max(0, Number(body.score) || 0),
    totalQuestions: Math.max(1, Number(body.totalQuestions) || player.totalQuestions || 10),
    result: String(body.result || "").trim(),
    status: "completed",
    completedAt: body.completedAt || nowIso(),
    answeredQuestionIndex: Number.isFinite(Number(body.answeredQuestionIndex))
      ? Number(body.answeredQuestionIndex)
      : Number(player.answeredQuestionIndex ?? -1),
    lastAnswerCorrect: Boolean(body.lastAnswerCorrect),
    lastSelectedIndex: Number.isFinite(Number(body.lastSelectedIndex))
      ? Number(body.lastSelectedIndex)
      : Number(player.lastSelectedIndex ?? -1),
  };
  if (state.room.seriesMode === "three-game") {
    const seriesScores = normalizeSeriesScores(player.seriesScores);
    const roundIndex = normalizeSeriesGameNumber(state.room.currentSeriesGame) - 1;
    seriesScores[roundIndex] = finishedPlayer.score;
    finishedPlayer.seriesScores = seriesScores;
    finishedPlayer.seriesTotalScore = playerSeriesTotal(finishedPlayer);
    finishedPlayer.seriesCompletedGames = seriesScores.filter((score, index) =>
      index <= roundIndex && Number.isFinite(Number(score))
    ).length;
  }

  const rows = await supabaseRequest("multiplayer_room_players?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([playerToRecord(finishedPlayer)]),
  });

  return {
    room: state.room,
    player: Array.isArray(rows) && rows.length ? playerFromRecord(rows[0], state.room) : finishedPlayer,
    players: (await getRoomState(code))?.players || [],
  };
}
