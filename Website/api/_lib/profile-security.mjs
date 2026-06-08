import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { normalizeProfile, profileFromRecord } from "./restaurant-data.mjs";
import { getSupabaseConfig, supabaseRequest } from "./supabase.mjs";

const PRIVATE_PROFILE_FIELDS = [
  "profileAccessTokenHash",
  "ownerUserId",
  "ownerEmail",
  "ownershipUpdatedAt",
];

export function generateProfileAccessToken() {
  return randomBytes(32).toString("base64url");
}

export function hashProfileAccessToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

export function getProfileAccessToken(request) {
  return String(request.headers.get("x-profile-token") || "").trim();
}

export function profileTokenMatches(profile, token) {
  const expected = String(profile?.profileAccessTokenHash || "");
  const actual = hashProfileAccessToken(token);
  if (!expected || expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

export function sanitizeProfile(profile) {
  const safeProfile = normalizeProfile(profile);
  PRIVATE_PROFILE_FIELDS.forEach((field) => {
    delete safeProfile[field];
  });
  return safeProfile;
}

export async function fetchProfileRecord(id) {
  const rows = await supabaseRequest(
    `profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

export async function fetchProfile(id) {
  const record = await fetchProfileRecord(id);
  return record ? profileFromRecord(record) : null;
}

export function buildStoredProfile(profile, privateFields = {}) {
  const normalized = normalizeProfile({
    ...profile,
    ...privateFields,
  });
  const timestamp = new Date().toISOString();

  return {
    id: normalized.id,
    player_name: normalized.playerName || "Player",
    restaurant_name: normalized.restaurantName || "Restaurant",
    restaurant_slug: normalized.restaurantSlug || "restaurant",
    is_guest: normalized.isGuest,
    created_at: normalized.createdAt || timestamp,
    updated_at: timestamp,
    payload_json: {
      ...normalized,
      updatedAt: timestamp,
    },
  };
}

export async function storeProfile(profile, privateFields = {}) {
  const payload = buildStoredProfile(profile, privateFields);
  await supabaseRequest("profiles?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([payload]),
  });
  return sanitizeProfile(payload.payload_json);
}

function stateSecret() {
  const { serviceRoleKey } = getSupabaseConfig();
  return serviceRoleKey;
}

export function createClaimState(profileId, maxAgeSeconds = 900) {
  const payload = Buffer.from(
    JSON.stringify({
      profileId: String(profileId || ""),
      expiresAt: Date.now() + maxAgeSeconds * 1000,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readClaimState(value) {
  const [payload, signature] = String(value || "").split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  if (
    expected.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.profileId || Number(data.expiresAt) < Date.now()) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
