import { fetchRestaurantsFromSupabase } from "../_lib/restaurant-admin.mjs";
import { hasSupabaseConfig, jsonResponse } from "../_lib/supabase.mjs";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return jsonResponse([]);
  }

  try {
    const restaurants = await fetchRestaurantsFromSupabase();
    return jsonResponse(restaurants);
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
