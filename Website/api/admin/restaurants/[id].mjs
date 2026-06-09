import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import {
  deleteRestaurant,
  saveRestaurant,
  validateRestaurant,
} from "../../_lib/restaurant-admin.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../../_lib/supabase.mjs";

function getRestaurantIdFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "").trim();
}

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

export async function PUT(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const id = getRestaurantIdFromRequest(request);
    const body = await readJsonBody(request);
    const { restaurant, errors } = validateRestaurant({
      ...(body && typeof body === "object" ? body : {}),
      id,
    });

    if (errors.length) {
      return jsonResponse({ ok: false, errors }, 400);
    }

    return jsonResponse({ ok: true, restaurant: await saveRestaurant(restaurant) });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function DELETE(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const id = getRestaurantIdFromRequest(request);
    if (!id) return jsonResponse({ ok: false, error: "Restaurant id is required." }, 400);
    await deleteRestaurant(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
