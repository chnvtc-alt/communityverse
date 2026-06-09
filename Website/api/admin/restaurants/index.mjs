import { randomUUID } from "node:crypto";
import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import {
  fetchAdminRestaurantsFromSupabase,
  filterAdminRestaurants,
  saveRestaurant,
  slugifyRestaurant,
  validateRestaurant,
} from "../../_lib/restaurant-admin.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../../_lib/supabase.mjs";

function createRestaurantId(name) {
  const slug = slugifyRestaurant(name).slice(0, 48);
  return `${slug || "restaurant"}-${randomUUID().slice(0, 8)}`;
}

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

export async function GET(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const url = new URL(request.url);
    const restaurants = filterAdminRestaurants(await fetchAdminRestaurantsFromSupabase(), url.searchParams);
    return jsonResponse({ ok: true, restaurants, count: restaurants.length });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function POST(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const { restaurant, errors } = validateRestaurant({
      ...(body && typeof body === "object" ? body : {}),
      id: String(body?.id || "").trim() || createRestaurantId(body?.name),
    });

    if (errors.length) {
      return jsonResponse({ ok: false, errors }, 400);
    }

    return jsonResponse({ ok: true, restaurant: await saveRestaurant(restaurant) }, 201);
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
