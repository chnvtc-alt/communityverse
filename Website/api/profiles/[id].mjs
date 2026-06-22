import {
  fetchProfile,
  getProfileAccessToken,
  hashProfileAccessToken,
  profileTokenMatches,
  preserveNewerRestaurantName,
  sanitizeProfile,
  storeProfile,
  validateRestaurantSlugAvailable,
} from "../_lib/profile-security.mjs";
import { validateRestaurantProfileName } from "../_lib/restaurant-name-rules.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../_lib/supabase.mjs";

function getProfileIdFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "").trim();
}

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    const id = getProfileIdFromRequest(request);
    if (!id) {
      return jsonResponse({ ok: false, error: "Profile id is required." }, 400);
    }

    const profile = await fetchProfile(id);
    if (!profile) {
      return jsonResponse({ ok: false, error: "Profile not found." }, 404);
    }

    return jsonResponse(sanitizeProfile(profile));
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}

export async function PUT(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const id = getProfileIdFromRequest(request);
  if (!id) {
    return jsonResponse({ ok: false, error: "Profile id is required." }, 400);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Expected a JSON profile object." }, 400);
  }

  const nameError = validateRestaurantProfileName(body.restaurantName);
  if (nameError) {
    return jsonResponse({ ok: false, error: nameError }, 400);
  }

  try {
    const token = getProfileAccessToken(request);
    if (!token) {
      return jsonResponse({ ok: false, error: "Profile access token is required." }, 401);
    }

    const existing = await fetchProfile(id);
    if (existing?.profileAccessTokenHash && !profileTokenMatches(existing, token)) {
      return jsonResponse({ ok: false, error: "This restaurant belongs to another player." }, 403);
    }

    const profileToStore = preserveNewerRestaurantName(existing, { ...body, id });
    if (!existing || existing.restaurantSlug !== profileToStore.restaurantSlug) {
      await validateRestaurantSlugAvailable(profileToStore.restaurantSlug, profileToStore.id);
    }

    const privateFields = existing
      ? {
          profileAccessTokenHash:
            existing.profileAccessTokenHash || hashProfileAccessToken(token),
          ownerUserId: existing.ownerUserId,
          ownerEmail: existing.ownerEmail,
          ownershipUpdatedAt: existing.ownershipUpdatedAt,
        }
      : {
          profileAccessTokenHash: hashProfileAccessToken(token),
        };
    return jsonResponse(await storeProfile(profileToStore, privateFields));
  } catch (error) {
    const status = Number(error?.status) || 500;
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      status >= 400 && status < 600 ? status : 500
    );
  }
}
