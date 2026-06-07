import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import {
  deleteQuestion,
  saveQuestion,
  validateQuestion,
} from "../../_lib/question-admin.mjs";
import {
  hasSupabaseConfig,
  jsonResponse,
  readJsonBody,
} from "../../_lib/supabase.mjs";

function getQuestionId(request) {
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

export async function PUT(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const id = getQuestionId(request);
    const body = await readJsonBody(request);
    const { question, errors } = validateQuestion(body, id);
    if (errors.length) {
      return jsonResponse({ ok: false, errors }, 400);
    }

    return jsonResponse({ ok: true, question: await saveQuestion(question) });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function DELETE(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const id = getQuestionId(request);
    if (!id) return jsonResponse({ ok: false, error: "Question id is required." }, 400);
    await deleteQuestion(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
