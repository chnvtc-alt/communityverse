import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import { profileFromRecord } from "../../_lib/restaurant-data.mjs";
import { validateRestaurantProfileName } from "../../_lib/restaurant-name-rules.mjs";
import {
  createClaimState,
  fetchProfile,
  storeProfile,
  validateRestaurantSlugAvailable,
} from "../../_lib/profile-security.mjs";
import {
  hasSupabaseConfig,
  jsonResponse,
  readJsonBody,
  supabaseAuthRequest,
  supabaseRequest,
} from "../../_lib/supabase.mjs";

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

function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function redirectOrigin(request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = String(request.headers.get("x-forwarded-host") || "").trim();
  const forwardedProtocol = String(request.headers.get("x-forwarded-proto") || "").trim();
  if (forwardedHost) {
    return `${forwardedProtocol || "https"}://${forwardedHost}`;
  }
  return requestUrl.origin;
}

async function findProfilesForEmail(email) {
  const normalized = normalizedEmail(email);
  if (!normalized) {
    return [];
  }

  const rows = await supabaseRequest(
    "profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc"
  );
  const profiles = Array.isArray(rows) ? rows.map(profileFromRecord).filter(Boolean) : [];
  return profiles.filter((profile) => {
    return normalizedEmail(profile.ownerEmail) === normalized ||
      normalizedEmail(profile.pendingOwnerEmail) === normalized;
  });
}

async function validateClaimEmailAvailable(email, profileId) {
  const matches = await findProfilesForEmail(email);
  const otherProfile = matches.find((profile) => profile.id !== profileId);
  if (!otherProfile) {
    return;
  }

  const error = new Error("That email is already connected to another restaurant. Use Email Sign-In to restore that restaurant instead.");
  error.status = 409;
  throw error;
}

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

export async function POST(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const id = getProfileIdFromRequest(request);
    if (!id) return jsonResponse({ ok: false, error: "Profile id is required." }, 400);

    const body = await readJsonBody(request);
    if (body?.action !== "send-claim-link") {
      return jsonResponse({ ok: false, error: "Unknown profile action." }, 400);
    }

    const email = normalizedEmail(body.email);
    if (!email || !email.includes("@")) {
      return jsonResponse({ ok: false, error: "Enter a valid email address." }, 400);
    }

    const existing = await fetchProfile(id);
    if (!existing) {
      return jsonResponse({ ok: false, error: "Profile not found." }, 404);
    }

    if (existing.ownerUserId || existing.ownerEmail) {
      return jsonResponse({ ok: false, error: "This restaurant is already connected to an email." }, 409);
    }

    await validateClaimEmailAvailable(email, id);

    const claimState = createClaimState(id);
    await storeProfile(existing, {
      profileAccessTokenHash: existing.profileAccessTokenHash,
      ownerUserId: existing.ownerUserId,
      ownerEmail: existing.ownerEmail,
      ownershipUpdatedAt: existing.ownershipUpdatedAt,
      pendingOwnerEmail: email,
      pendingOwnershipUpdatedAt: new Date().toISOString(),
    });

    const redirectUrl = new URL("/restaurant/", redirectOrigin(request));
    redirectUrl.searchParams.set("hub", "1");
    redirectUrl.searchParams.set("auth", "callback");
    redirectUrl.searchParams.set("claim_state", claimState);

    await supabaseAuthRequest(`otp?redirect_to=${encodeURIComponent(redirectUrl.toString())}`, {
      method: "POST",
      body: JSON.stringify({
        email,
        create_user: true,
        options: {
          email_redirect_to: redirectUrl.toString(),
        },
      }),
    });

    return jsonResponse({
      ok: true,
      message: `Claim link sent to ${email}.`,
    });
  } catch (error) {
    const status = Number(error?.status) || 500;
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      status >= 400 && status < 600 ? status : 500
    );
  }
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
