import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import { validateRestaurantProfileName } from "../../_lib/restaurant-name-rules.mjs";
import { fetchProfile, storeProfile, validateRestaurantSlugAvailable } from "../../_lib/profile-security.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../../_lib/supabase.mjs";

function getProfileIdFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "").trim();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizePlayerType(value) {
  const playerType = String(value || "").trim().toLowerCase();
  return ["admin", "tester"].includes(playerType) ? playerType : "normal";
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
    const id = getProfileIdFromRequest(request);
    if (!id) return jsonResponse({ ok: false, error: "Profile id is required." }, 400);

    const body = await readJsonBody(request);
    const restaurantName = String(body?.restaurantName || "").trim();
    const playerType = normalizePlayerType(body?.playerType);
    const nameError = validateRestaurantProfileName(restaurantName);
    if (nameError) {
      return jsonResponse({ ok: false, error: nameError }, 400);
    }

    const existing = await fetchProfile(id);
    if (!existing) {
      return jsonResponse({ ok: false, error: "Profile not found." }, 404);
    }

    const restaurantSlug = slugify(restaurantName);
    if (existing.restaurantSlug !== restaurantSlug) {
      await validateRestaurantSlugAvailable(restaurantSlug, existing.id);
    }

    const profile = await storeProfile(
      {
        ...existing,
        restaurantName,
        restaurantSlug,
        restaurantNameUpdatedAt: new Date().toISOString(),
        playerType,
      },
      {
        profileAccessTokenHash: existing.profileAccessTokenHash,
        ownerUserId: existing.ownerUserId,
        ownerEmail: existing.ownerEmail,
        ownershipUpdatedAt: existing.ownershipUpdatedAt,
        pendingOwnerEmail: existing.pendingOwnerEmail,
        pendingOwnershipUpdatedAt: existing.pendingOwnershipUpdatedAt,
      }
    );

    return jsonResponse({ ok: true, profile });
  } catch (error) {
    const status = Number(error?.status) || 500;
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      status >= 400 && status < 600 ? status : 500
    );
  }
}
