import { buildLeaderboard, normalizeRestaurantSlug, profileFromRecord, sessionFromRecord } from "./_lib/restaurant-data.mjs";
import { fetchRestaurantsFromSupabase } from "./_lib/restaurant-admin.mjs";
import { hasSupabaseConfig, jsonResponse, supabaseRequest, supabaseRequestAll } from "./_lib/supabase.mjs";

async function fetchProfiles() {
  const rows = await supabaseRequest("profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc");
  return Array.isArray(rows) ? rows.map(profileFromRecord).filter(Boolean) : [];
}

async function fetchSessionStatsByProfile() {
  const rows = await supabaseRequestAll(
    "sessions?select=id,profile_id,restaurant_slug,completed_at,payload_json&order=completed_at.desc"
  );
  const statsByProfile = {};
  const seenSessionIds = new Set();
  (Array.isArray(rows) ? rows : []).map(sessionFromRecord).filter(Boolean).forEach((session) => {
    const sessionId = String(session.id || "").trim();
    const profileId = String(session.profileId || "").trim();
    const restaurantSlug = normalizeRestaurantSlug(session.restaurantSlug || "");
    if (!profileId || !restaurantSlug || (sessionId && seenSessionIds.has(sessionId))) {
      return;
    }
    if (sessionId) {
      seenSessionIds.add(sessionId);
    }

    statsByProfile[profileId] = statsByProfile[profileId] || {};
    const stats = statsByProfile[profileId][restaurantSlug] || { gamesPlayed: 0, totalCorrectAnswers: 0 };
    stats.gamesPlayed += 1;
    stats.totalCorrectAnswers += Number(session.score) || 0;
    statsByProfile[profileId][restaurantSlug] = stats;
  });

  return statsByProfile;
}

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    const url = new URL(request.url);
    const metric = String(url.searchParams.get("metric") || "estimatedSales");
    const restaurantSlug = String(url.searchParams.get("restaurantSlug") || "");
    const profiles = await fetchProfiles();
    const sessionStatsByProfile = await fetchSessionStatsByProfile();
    const restaurants = await fetchRestaurantsFromSupabase();
    const publicRestaurantSlugs = restaurants
      .filter((restaurant) => restaurant.visibleInList !== false)
      .map((restaurant) => restaurant.slug);

    return jsonResponse(buildLeaderboard(profiles, metric, restaurantSlug, {
      publicRestaurantSlugs,
      sessionStatsByProfile,
    }));
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
