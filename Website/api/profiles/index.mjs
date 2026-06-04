import { normalizeProfile, profileFromRecord } from "../_lib/restaurant-data.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody, supabaseRequest } from "../_lib/supabase.mjs";

async function fetchProfiles() {
  const rows = await supabaseRequest("profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc");
  return Array.isArray(rows) ? rows.map(profileFromRecord).filter(Boolean) : [];
}

async function upsertProfile(profile) {
  const normalized = normalizeProfile(profile);
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

export async function GET() {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  return jsonResponse(await fetchProfiles());
}

export async function POST(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Expected a JSON profile object." }, 400);
  }

  if (!String(body.id || "").trim()) {
    return jsonResponse({ ok: false, error: "Profile id is required." }, 400);
  }

  return jsonResponse(await upsertProfile(body), 201);
}
