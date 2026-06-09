import { requireQuestionsAdmin } from "../_lib/admin-auth.mjs";
import {
  hasSupabaseConfig,
  jsonResponse,
  supabasePublicStorageUrl,
  supabaseStorageRequest,
} from "../_lib/supabase.mjs";
import { slugifyRestaurant } from "../_lib/restaurant-admin.mjs";

const BUCKET_ID = "restaurant-images";
const VALID_KINDS = new Set(["hero", "logo"]);

function getImageExtension(file) {
  const mime = String(file?.type || "").toLowerCase();
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
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

export async function POST(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }

  try {
    const formData = await request.formData();
    const restaurantSlug = slugifyRestaurant(formData.get("slug"));
    const kind = String(formData.get("kind") || "").trim().toLowerCase();
    const file = formData.get("image");

    if (!restaurantSlug) {
      return jsonResponse({ ok: false, error: "Restaurant page link name is required." }, 400);
    }

    if (!VALID_KINDS.has(kind)) {
      return jsonResponse({ ok: false, error: "Image kind must be hero or logo." }, 400);
    }

    if (!(file instanceof File)) {
      return jsonResponse({ ok: false, error: "Choose an image first." }, 400);
    }

    if (!String(file.type || "").startsWith("image/")) {
      return jsonResponse({ ok: false, error: "Please upload an image file." }, 400);
    }

    if (file.size > 5_000_000) {
      return jsonResponse({ ok: false, error: "The image is too large." }, 400);
    }

    await ensureBucket();

    const path = `${BUCKET_ID}/${restaurantSlug}/${kind}.${getImageExtension(file)}`;
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
      kind,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
