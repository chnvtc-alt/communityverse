import { normalizeProfile, profileFromRecord } from "../_lib/restaurant-data.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody, supabaseRequest } from "../_lib/supabase.mjs";

async function fetchProfile(id) {
  const rows = await supabaseRequest(
    `profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&id=eq.${encodeURIComponent(id)}&limit=1`
  );

  return Array.isArray(rows) && rows.length ? profileFromRecord(rows[0]) : null;
}

async function upsertProfile(id, body) {
  const normalized = normalizeProfile({ ...body, id });
  const payload = {
    id: normalized.id,
    player_name: normalized.playerName || "Player",
    restaurant_name: normalized.restaurantName || "Restaurant",
    restaurant_slug: normalized.restaurantSlug || "restaurant",
    is_guest: normalized.isGuest,
    created_at: normalized.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payload_json: normalized,
  };

  await supabaseRequest("profiles?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([payload]),
  });

  return {
    ...normalized,
    updatedAt: payload.updated_at,
  };
}

function getProfileIdFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "").trim();
}

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const id = getProfileIdFromRequest(request);
  if (!id) {
    return jsonResponse({ ok: false, error: "Profile id is required." }, 400);
  }

  const profile = await fetchProfile(id);
  if (!profile) {
    return jsonResponse({ ok: false, error: "Profile not found." }, 404);
  }

  return jsonResponse(profile);
}

export async function PUT(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const id = getProfileIdFromRequest(request);
  if (!id) {
    return jsonResponse({ ok: false, error: "Profile id is required." }, 400);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Expected a JSON profile object." }, 400);
  }

  return jsonResponse(await upsertProfile(id, body));
}
