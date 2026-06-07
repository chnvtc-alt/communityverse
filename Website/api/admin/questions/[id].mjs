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
  supabasePublicStorageUrl,
  supabaseStorageRequest,
} from "../../_lib/supabase.mjs";

const BUCKET_ID = "question-images";

function getQuestionId(request) {
  return decodeURIComponent(new URL(request.url).pathname.split("/").filter(Boolean).pop() || "").trim();
}

function getImageExtension(file) {
  const mime = String(file?.type || "").toLowerCase();
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "img";
}

async function ensureBucket() {
  try {
    await supabaseStorageRequest(`bucket/${BUCKET_ID}`, { method: "GET" });
  } catch {
    await supabaseStorageRequest("bucket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: BUCKET_ID, name: BUCKET_ID, public: true }),
    });
  }
}

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

async function handleImageUpload(request) {
  const id = getQuestionId(request);
  if (!id) {
    return jsonResponse({ ok: false, error: "Question id is required." }, 400);
  }

  const formData = await request.formData();
  const file = formData.get("image") || formData.get("photo");

  if (!(file instanceof File)) {
    return jsonResponse({ ok: false, error: "Choose an image first." }, 400);
  }

  if (!String(file.type || "").startsWith("image/")) {
    return jsonResponse({ ok: false, error: "Please upload an image file." }, 400);
  }

  if (file.size > 4_000_000) {
    return jsonResponse({ ok: false, error: "The image is too large." }, 400);
  }

  await ensureBucket();

  const path = `${BUCKET_ID}/${encodeURIComponent(id)}.${getImageExtension(file)}`;
  await supabaseStorageRequest(`object/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: new Uint8Array(await file.arrayBuffer()),
  });

  return jsonResponse({
    ok: true,
    image: supabasePublicStorageUrl(path),
    path,
  });
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

export async function POST(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const contentType = String(request.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("multipart/form-data")) {
      return await handleImageUpload(request);
    }

    return jsonResponse({ ok: false, error: "This route only accepts image uploads or question updates." }, 400);
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
