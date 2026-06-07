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
