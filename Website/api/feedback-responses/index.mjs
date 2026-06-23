import { fetchRestaurantBySlugFromSupabase } from "../_lib/restaurant-admin.mjs";
import { fetchFeedbackResponses, normalizeFeedbackResponse, saveFeedbackResponse } from "../_lib/feedback-responses.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../_lib/supabase.mjs";

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Feedback is not configured yet." }, 503);
  }

  try {
    const url = new URL(request.url);
    const restaurantSlug = String(url.searchParams.get("restaurantSlug") || "").trim();
    const accessCode = String(url.searchParams.get("accessCode") || url.searchParams.get("code") || "").trim();
    if (!restaurantSlug || !accessCode) {
      return jsonResponse({ ok: false, error: "Restaurant and access code are required." }, 400);
    }

    const restaurant = await fetchRestaurantBySlugFromSupabase(restaurantSlug, { includeHidden: true });
    if (!restaurant || !restaurant.feedbackResultsAccessCode || restaurant.feedbackResultsAccessCode !== accessCode) {
      return jsonResponse({ ok: false, error: "That feedback results link is not valid." }, 403);
    }

    const responses = await fetchFeedbackResponses(new URLSearchParams({ restaurantSlug: restaurant.slug }));
    return jsonResponse({
      ok: true,
      restaurant: {
        slug: restaurant.slug,
        name: restaurant.name,
      },
      responses,
      count: responses.length,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function POST(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Feedback is not configured yet." }, 503);
  }

  try {
    const body = await readJsonBody(request);
    if (!body || typeof body !== "object") {
      return jsonResponse({ ok: false, error: "Expected a feedback response." }, 400);
    }

    const response = normalizeFeedbackResponse(body);
    if (!response.restaurantSlug) {
      return jsonResponse({ ok: false, error: "Restaurant is required." }, 400);
    }

    return jsonResponse({ ok: true, response: await saveFeedbackResponse(response) }, 201);
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 400);
  }
}
