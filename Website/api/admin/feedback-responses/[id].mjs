import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import { deleteFeedbackResponse } from "../../_lib/feedback-responses.mjs";
import { hasSupabaseConfig, jsonResponse } from "../../_lib/supabase.mjs";

function getFeedbackResponseId(request) {
  return decodeURIComponent(new URL(request.url).pathname.split("/").filter(Boolean).pop() || "").trim();
}

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

export async function DELETE(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const id = getFeedbackResponseId(request);
    if (!id) {
      return jsonResponse({ ok: false, error: "Feedback response id is required." }, 400);
    }

    await deleteFeedbackResponse(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
