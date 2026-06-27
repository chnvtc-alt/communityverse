import { createRoom } from "../../../_lib/multiplayer-rooms.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../../../_lib/supabase.mjs";

export async function POST(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Expected a JSON room object." }, 400);
  }

  try {
    return jsonResponse({ ok: true, ...(await createRoom(body)) }, 201);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      400
    );
  }
}
