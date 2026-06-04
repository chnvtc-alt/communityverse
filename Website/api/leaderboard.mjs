import { buildLeaderboard, profileFromRecord } from "./_lib/restaurant-data.mjs";
import { hasSupabaseConfig, jsonResponse, supabaseRequest } from "./_lib/supabase.mjs";

async function fetchProfiles() {
  const rows = await supabaseRequest("profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc");
  return Array.isArray(rows) ? rows.map(profileFromRecord).filter(Boolean) : [];
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
    return jsonResponse(buildLeaderboard(profiles, metric, restaurantSlug));
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
