import {
  createClaimState,
  fetchProfile,
  generateProfileAccessToken,
  getProfileAccessToken,
  hashProfileAccessToken,
  profileTokenMatches,
  readClaimState,
  sanitizeProfile,
  storeProfile,
} from "../_lib/profile-security.mjs";
import {
  hasSupabaseConfig,
  jsonResponse,
  readJsonBody,
  supabaseAuthRequest,
  supabaseRequest,
} from "../_lib/supabase.mjs";
import { profileFromRecord } from "../_lib/restaurant-data.mjs";

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
    }
  );

  return jsonResponse({
    ok: true,
    profile: sanitizeProfile(profile),
    profileAccessToken,
  });
}

export async function POST(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    const body = await readJsonBody(request);
    if (!body || typeof body !== "object") {
      return jsonResponse({ ok: false, error: "Expected a JSON request." }, 400);
    }

    if (body.action === "send") {
      return await sendMagicLink(request, body);
    }
    if (body.action === "complete") {
      return await completeMagicLink(body);
    }
    return jsonResponse({ ok: false, error: "Unknown auth action." }, 400);
  } catch (error) {
    const status = Number(error?.status) || 500;
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      status >= 400 && status < 600 ? status : 500
    );
  }
}
