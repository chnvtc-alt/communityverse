import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import { profileFromRecord } from "../../_lib/restaurant-data.mjs";
import { sanitizeProfile } from "../../_lib/profile-security.mjs";
import { hasSupabaseConfig, jsonResponse, supabaseRequest } from "../../_lib/supabase.mjs";

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

function profileMatchesSearch(profile, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return [
    profile.id,
    profile.playerName,
    profile.restaurantName,
    profile.restaurantSlug,
    profile.ownerEmail,
  ]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value.includes(normalizedQuery));
}

function sanitizeAdminProfile(profile) {
  const safeProfile = sanitizeProfile(profile);
  const ownerEmail = String(profile?.ownerEmail || "").trim().toLowerCase();
  if (ownerEmail) {
    safeProfile.ownerEmail = ownerEmail;
    safeProfile.emailConnected = true;
  }
  return safeProfile;
}

function filterProfiles(profiles, searchParams) {
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  return profiles
    .filter((profile) => {
      if (type === "guest" && !profile.isGuest) return false;
      if (type === "registered" && profile.isGuest) return false;
      return profileMatchesSearch(profile, query);
    })
    .map(sanitizeAdminProfile);
}

export async function GET(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const rows = await supabaseRequest(
      "profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc"
    );
    const url = new URL(request.url);
    const profiles = filterProfiles(
      Array.isArray(rows) ? rows.map(profileFromRecord).filter(Boolean) : [],
      url.searchParams
    );
    return jsonResponse({ ok: true, profiles, count: profiles.length });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
