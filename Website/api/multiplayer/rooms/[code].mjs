import { finishRoomPlayer, getRoomState, joinRoom } from "../../_lib/multiplayer-rooms.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../../_lib/supabase.mjs";

function getRoomCodeFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "").trim();
}

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    const state = await getRoomState(getRoomCodeFromRequest(request));
    if (!state) {
      return jsonResponse({ ok: false, error: "Room not found." }, 404);
    }
    return jsonResponse({ ok: true, ...state });
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}

export async function POST(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Expected a JSON room action." }, 400);
  }

  try {
    const code = getRoomCodeFromRequest(request);
    if (body.action === "finish") {
      return jsonResponse({ ok: true, ...(await finishRoomPlayer(code, body)) });
    }
    if (body.action === "join") {
      return jsonResponse({ ok: true, ...(await joinRoom(code, body)) }, 201);
    }
    return jsonResponse({ ok: false, error: "Unknown room action." }, 400);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      400
    );
  }
}
