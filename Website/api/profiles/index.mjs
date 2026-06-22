import { profileFromRecord } from "../_lib/restaurant-data.mjs";
import { validateRestaurantProfileName } from "../_lib/restaurant-name-rules.mjs";
import {
  createClaimState,
  fetchProfile,
  generateProfileAccessToken,
  getProfileAccessToken,
  hashProfileAccessToken,
  profileTokenMatches,
  preserveNewerRestaurantName,
  readClaimState,
  sanitizeProfile,
  storeProfile,
  validateRestaurantSlugAvailable,
} from "../_lib/profile-security.mjs";
import {
  hasSupabaseConfig,
  jsonResponse,
  readJsonBody,
  supabaseAuthRequest,
  supabaseRequest,
} from "../_lib/supabase.mjs";

async function fetchProfiles() {
  const rows = await supabaseRequest("profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc");
  return Array.isArray(rows)
    ? rows.map(profileFromRecord).filter(Boolean).map(sanitizeProfile)
    : [];
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

async function findProfileForOwner(ownerUserId) {
  const rows = await supabaseRequest(
    "profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc"
  );
  const profiles = Array.isArray(rows) ? rows.map(profileFromRecord).filter(Boolean) : [];
  return profiles.find((profile) => profile.ownerUserId === ownerUserId) || null;
}

async function findPendingProfileForEmail(email) {
  const normalized = normalizedEmail(email);
  if (!normalized) {
    return null;
  }
  const rows = await supabaseRequest(
    "profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&order=updated_at.desc"
  );
  const profiles = Array.isArray(rows) ? rows.map(profileFromRecord).filter(Boolean) : [];
  return profiles.find((profile) => normalizedEmail(profile.pendingOwnerEmail) === normalized) || null;
}

async function sendMagicLink(request, body) {
  const email = normalizedEmail(body.email);
  if (!email || !email.includes("@")) {
    return jsonResponse({ ok: false, error: "Enter a valid email address." }, 400);
  }

  let claimState = "";
  const profileId = String(body.profileId || "").trim();
  if (profileId) {
    const profile = await fetchProfile(profileId);
    const token = getProfileAccessToken(request);
    if (!profile || !token || !profileTokenMatches(profile, token)) {
      return jsonResponse({ ok: false, error: "Unable to verify this restaurant." }, 403);
    }
    if (profile.ownerUserId) {
      return jsonResponse({ ok: false, error: "This restaurant is already registered." }, 409);
    }
    claimState = createClaimState(profileId);
    await storeProfile(profile, {
      profileAccessTokenHash: profile.profileAccessTokenHash,
      ownerUserId: profile.ownerUserId,
      ownerEmail: profile.ownerEmail,
      ownershipUpdatedAt: profile.ownershipUpdatedAt,
      pendingOwnerEmail: email,
      pendingOwnershipUpdatedAt: new Date().toISOString(),
    });
  }

  const redirectUrl = new URL("/restaurant/", redirectOrigin(request));
  redirectUrl.searchParams.set("hub", "1");
  redirectUrl.searchParams.set("auth", "callback");
  if (claimState) {
    redirectUrl.searchParams.set("claim_state", claimState);
  }

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
    message: "Check your email for a secure sign-in link.",
  });
}

async function completeMagicLink(body) {
  const accessToken = String(body.accessToken || "").trim();
  if (!accessToken) {
    return jsonResponse({ ok: false, error: "The sign-in link is incomplete." }, 400);
  }

  const user = await supabaseAuthRequest("user", { method: "GET" }, accessToken);
  if (!user?.id || !user?.email) {
    return jsonResponse({ ok: false, error: "Unable to verify this email address." }, 401);
  }

  const claim = body.claimState ? readClaimState(body.claimState) : null;
  if (body.claimState && !claim) {
    return jsonResponse({ ok: false, error: "This registration link has expired. Please request another." }, 400);
  }

  let profile = claim
    ? await fetchProfile(claim.profileId)
    : await findProfileForOwner(user.id);

  if (!profile && !claim) {
    profile = await findPendingProfileForEmail(user.email);
  }

  if (!profile) {
    return jsonResponse(
      {
        ok: false,
        error: claim
          ? "The restaurant could not be found."
          : "No saved restaurant is connected to this email yet.",
      },
      404
    );
  }

  if (profile.ownerUserId && profile.ownerUserId !== user.id) {
    return jsonResponse({ ok: false, error: "This restaurant belongs to another account." }, 403);
  }

  const profileAccessToken = generateProfileAccessToken();
  profile = await storeProfile(
    {
      ...profile,
      isGuest: false,
    },
    {
      profileAccessTokenHash: hashProfileAccessToken(profileAccessToken),
      ownerUserId: user.id,
      ownerEmail: normalizedEmail(user.email),
      ownershipUpdatedAt: new Date().toISOString(),
      pendingOwnerEmail: "",
      pendingOwnershipUpdatedAt: "",
    }
  );

  return jsonResponse({
    ok: true,
    profile: sanitizeProfile(profile),
    profileAccessToken,
  });
}

export async function GET() {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    return jsonResponse(await fetchProfiles());
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}

export async function POST(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Expected a JSON profile object." }, 400);
  }

  try {
    if (body.action === "send") {
      return await sendMagicLink(request, body);
    }
    if (body.action === "complete") {
      return await completeMagicLink(body);
    }
  } catch (error) {
    const status = Number(error?.status) || 500;
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      status >= 400 && status < 600 ? status : 500
    );
  }

  if (!String(body.id || "").trim()) {
    return jsonResponse({ ok: false, error: "Profile id is required." }, 400);
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

    const existing = await fetchProfile(body.id);
    if (existing && !profileTokenMatches(existing, token)) {
      return jsonResponse({ ok: false, error: "This restaurant belongs to another player." }, 403);
    }

    const profileToStore = preserveNewerRestaurantName(existing, body);
    if (!existing || existing.restaurantSlug !== profileToStore.restaurantSlug) {
      await validateRestaurantSlugAvailable(profileToStore.restaurantSlug, profileToStore.id);
    }

    const privateFields = existing
      ? {
          profileAccessTokenHash: existing.profileAccessTokenHash,
          ownerUserId: existing.ownerUserId,
          ownerEmail: existing.ownerEmail,
          ownershipUpdatedAt: existing.ownershipUpdatedAt,
        }
      : {
          profileAccessTokenHash: hashProfileAccessToken(token),
        };
    return jsonResponse(await storeProfile(profileToStore, privateFields), existing ? 200 : 201);
  } catch (error) {
    const status = Number(error?.status) || 500;
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      status >= 400 && status < 600 ? status : 500
    );
  }
}
