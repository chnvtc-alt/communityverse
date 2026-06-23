import { normalizeFeedbackResponse, saveFeedbackResponse } from "../_lib/feedback-responses.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../_lib/supabase.mjs";

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
