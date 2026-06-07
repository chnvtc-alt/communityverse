import { randomUUID } from "node:crypto";
import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import {
  fetchAdminQuestions,
  filterAdminQuestions,
  saveQuestion,
  validateQuestion,
} from "../../_lib/question-admin.mjs";
import {
  hasSupabaseConfig,
  jsonResponse,
  readJsonBody,
} from "../../_lib/supabase.mjs";

function createQuestionId(prompt) {
  const slug = String(prompt || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || "question"}-${randomUUID().slice(0, 8)}`;
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
    const questions = filterAdminQuestions(await fetchAdminQuestions(), url.searchParams);
    return jsonResponse({ ok: true, questions, count: questions.length });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function POST(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const { question, errors } = validateQuestion({
      ...(body && typeof body === "object" ? body : {}),
      id: String(body?.id || "").trim() || createQuestionId(body?.prompt),
    });

    if (errors.length) {
      return jsonResponse({ ok: false, errors }, 400);
    }

    return jsonResponse({ ok: true, question: await saveQuestion(question) }, 201);
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
