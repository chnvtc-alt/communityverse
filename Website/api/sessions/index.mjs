import { sessionFromRecord } from "../_lib/restaurant-data.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody, supabaseRequest } from "../_lib/supabase.mjs";

async function fetchSessions(profileId = "") {
  const query = profileId
    ? `sessions?select=id,profile_id,restaurant_slug,completed_at,payload_json&profile_id=eq.${encodeURIComponent(profileId)}&order=completed_at.desc`
    : "sessions?select=id,profile_id,restaurant_slug,completed_at,payload_json&order=completed_at.desc";
  const rows = await supabaseRequest(query);
  return Array.isArray(rows) ? rows.map(sessionFromRecord).filter(Boolean) : [];
}

async function upsertSession(session) {
  const completedAt = String(session.completedAt || new Date().toISOString());
  const payload = {
    ...session,
    id: String(session.id || "").trim(),
    profileId: String(session.profileId || "").trim(),
    restaurantSlug: String(session.restaurantSlug || "").trim(),
    completedAt,
  };

  await supabaseRequest("sessions?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([
      {
        id: payload.id,
        profile_id: payload.profileId,
        restaurant_slug: payload.restaurantSlug,
        completed_at: payload.completedAt,
        payload_json: payload,
      },
    ]),
  });

  return payload;
}

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const url = new URL(request.url);
  const profileId = String(url.searchParams.get("profileId") || "").trim();
  return jsonResponse(await fetchSessions(profileId));
}

export async function POST(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Expected a JSON session object." }, 400);
  }

  if (!String(body.id || "").trim()) {
    return jsonResponse({ ok: false, error: "Session id is required." }, 400);
  }

  return jsonResponse(await upsertSession(body), 201);
}
