import { fetchFeedbackResponses } from "../../_lib/feedback-responses.mjs";
import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import { hasSupabaseConfig, jsonResponse } from "../../_lib/supabase.mjs";

export async function GET(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;

  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }

  try {
    const url = new URL(request.url);
    const responses = await fetchFeedbackResponses(url.searchParams);
    return jsonResponse({ ok: true, responses, count: responses.length });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
