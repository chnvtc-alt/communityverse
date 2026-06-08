import { profileFromRecord } from "../_lib/restaurant-data.mjs";
import {
  fetchProfile,
  getProfileAccessToken,
  hashProfileAccessToken,
  profileTokenMatches,
  sanitizeProfile,
  storeProfile,
} from "../_lib/profile-security.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody, supabaseRequest } from "../_lib/supabase.mjs";

async function fetchProfiles() {
  const rows = await supabaseRequest("profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc");
  return Array.isArray(rows)
    ? rows.map(profileFromRecord).filter(Boolean).map(sanitizeProfile)
    : [];
}

export async function GET() {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    return jsonResponse(await fetchProfiles());
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
    return jsonResponse({ ok: false, error: "Expected a JSON profile object." }, 400);
  }

  if (!String(body.id || "").trim()) {
    return jsonResponse({ ok: false, error: "Profile id is required." }, 400);
  }

  try {
    const token = getProfileAccessToken(request);
    if (!token) {
      return jsonResponse({ ok: false, error: "Profile access token is required." }, 401);
    }

    const existing = await fetchProfile(body.id);
    if (existing && !profileTokenMatches(existing, token)) {
      return jsonResponse({ ok: false, error: "This restaurant belongs to another player." }, 403);
    }

    const privateFields = existing
      ? {
          profileAccessTokenHash: existing.profileAccessTokenHash,
          ownerUserId: existing.ownerUserId,
          ownerEmail: existing.ownerEmail,
          ownershipUpdatedAt: existing.ownershipUpdatedAt,
        }
      : {
          profileAccessTokenHash: hashProfileAccessToken(token),
        };
    return jsonResponse(await storeProfile(body, privateFields), existing ? 200 : 201);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
