import { requireQuestionsAdmin } from "../_lib/admin-auth.mjs";
import {
  hasSupabaseConfig,
  jsonResponse,
  supabasePublicStorageUrl,
  supabaseRequest,
  supabaseStorageRequest,
} from "../_lib/supabase.mjs";

const BUCKET_ID = "customer-photos";

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

function customerPhotoPath(customerId) {
  return `${BUCKET_ID}/${encodeURIComponent(customerId)}.jpg`;
}

export async function POST(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }

  try {
    const formData = await request.formData();
    const customerId = String(formData.get("id") || "").trim();
    const file = formData.get("photo");

    if (!customerId) {
      return jsonResponse({ ok: false, error: "Customer id is required." }, 400);
    }

    if (!(file instanceof File)) {
      return jsonResponse({ ok: false, error: "Choose a JPG photo first." }, 400);
    }

    if (file.type !== "image/jpeg") {
      return jsonResponse({ ok: false, error: "Please upload a JPG photo." }, 400);
    }

    if (file.size > 2_000_000) {
      return jsonResponse({ ok: false, error: "The photo is too large." }, 400);
    }

    await ensureBucket();

    const path = customerPhotoPath(customerId);
    const body = new Uint8Array(await file.arrayBuffer());
    await supabaseStorageRequest(`object/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
      },
      body,
    });

    const image = supabasePublicStorageUrl(path);

    try {
      await supabaseRequest("customers?on_conflict=id", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify([{ id: customerId, image }]),
      });
    } catch {
      // The caller may save the customer record separately. The upload itself succeeded.
    }

    return jsonResponse({ ok: true, image, path });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
