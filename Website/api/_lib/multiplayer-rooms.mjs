import { supabaseRequest } from "./supabase.mjs";

const ROOM_DURATION_MINUTES = 15;
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
  };
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
  const room = {
    id: randomString("room"),
    roomCode: await createUniqueRoomCode(),
    restaurantSlug,
    customerId,
    questionIds,
    status: "open",
    createdAt,
    expiresAt: addMinutes(new Date(createdAt), ROOM_DURATION_MINUTES),
  };

  const rows = await supabaseRequest("multiplayer_rooms?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([roomToRecord(room)]),
  });
  const savedRoom = Array.isArray(rows) && rows.length ? roomFromRecord(rows[0]) : room;
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
  };

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
