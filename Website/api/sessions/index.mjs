import { emptyStats, normalizeProfile, normalizeRestaurantSlug, sessionFromRecord } from "../_lib/restaurant-data.mjs";
import {
  fetchProfile,
  getProfileAccessToken,
  profileTokenMatches,
  storeProfile,
} from "../_lib/profile-security.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody, supabaseRequest } from "../_lib/supabase.mjs";

async function fetchSessions(profileId = "") {
  const query = profileId
    ? `sessions?select=id,profile_id,restaurant_slug,completed_at,payload_json&profile_id=eq.${encodeURIComponent(profileId)}&order=completed_at.desc`
    : "sessions?select=id,profile_id,restaurant_slug,completed_at,payload_json&order=completed_at.desc";
  const rows = await supabaseRequest(query);
  return Array.isArray(rows) ? rows.map(sessionFromRecord).filter(Boolean) : [];
}

async function upsertSession(session) {
  const completedAt = String(session.completedAt || new Date().toISOString());
  const payload = {
    ...session,
    id: String(session.id || "").trim(),
    profileId: String(session.profileId || "").trim(),
    restaurantSlug: String(session.restaurantSlug || "").trim(),
    completedAt,
  };

  await supabaseRequest("sessions?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([
      {
        id: payload.id,
        profile_id: payload.profileId,
        restaurant_slug: payload.restaurantSlug,
        completed_at: payload.completedAt,
        payload_json: payload,
      },
    ]),
  });

  return payload;
}

function statusRank(status) {
  if (status === "favorite") return 4;
  if (status === "regular") return 3;
  if (status === "occasional") return 2;
  if (status === "lost") return 1;
  return 0;
}

function favoriteValue(value) {
  return Math.round((Number(value) || 0) * 1.2);
}

function valueForStatus(entry, status) {
  const storedValue = Math.max(0, Number(entry?.customerValue) || 0);
  if (storedValue > 0) return storedValue;
  if (status === "favorite") return favoriteValue(entry.regularValue);
  if (status === "regular") return Number(entry.regularValue) || 0;
  if (status === "occasional") return Number(entry.occasionalValue) || 0;
  return 0;
}

function earnedPointTotal(profile) {
  const restaurantTotal = Object.values(profile?.restaurantStats || {}).reduce(
    (total, stats) => total + Math.max(0, Number(stats?.estimatedSales) || 0),
    0
  );
  return Math.max(0, Number(profile?.stats?.estimatedSales) || 0, restaurantTotal);
}

function addCollectionStats(stats, entry, status = entry?.status) {
  const safeStatus = ["favorite", "regular", "occasional", "lost"].includes(status) ? status : "occasional";
  if (safeStatus === "favorite") {
    stats.regularCustomers += 1;
    stats.favoriteCustomers += 1;
  } else if (safeStatus === "regular") {
    stats.regularCustomers += 1;
  } else if (safeStatus === "occasional") {
    stats.occasionalCustomers += 1;
  } else if (safeStatus === "lost") {
    stats.lostCustomers += 1;
  }
  stats.totalCustomerValue += valueForStatus(entry, safeStatus);
  stats.estimatedSales = stats.totalCustomerValue;
}

function mergeRestaurantCredit(existingCredit, nextCredit) {
  if (!existingCredit) {
    return nextCredit;
  }

  const bestStatus =
    statusRank(nextCredit.status) > statusRank(existingCredit.status)
      ? nextCredit.status
      : existingCredit.status;

  return {
    ...existingCredit,
    ...nextCredit,
    status: bestStatus,
    customerValue: Math.max(Number(existingCredit.customerValue) || 0, Number(nextCredit.customerValue) || 0),
    bestScore: Math.max(Number(existingCredit.bestScore) || 0, Number(nextCredit.bestScore) || 0),
    dateWon: String(nextCredit.dateWon || existingCredit.dateWon || ""),
  };
}

function rebuildProfileCollectionStats(profile) {
  const safeProfile = normalizeProfile(profile);
  const previousRestaurantStats = safeProfile.restaurantStats || {};
  const nextRestaurantStats = {};

  Object.entries(previousRestaurantStats).forEach(([restaurantSlug, stats]) => {
    nextRestaurantStats[restaurantSlug] = {
      ...emptyStats(),
      ...stats,
      regularCustomers: 0,
      favoriteCustomers: 0,
      occasionalCustomers: 0,
      lostCustomers: 0,
      totalCustomerValue: 0,
      estimatedSales: 0,
    };
  });

  safeProfile.stats = {
    ...emptyStats(),
    ...safeProfile.stats,
    regularCustomers: 0,
    favoriteCustomers: 0,
    occasionalCustomers: 0,
    lostCustomers: 0,
    totalCustomerValue: 0,
    estimatedSales: 0,
  };

  safeProfile.customerCollection.forEach((entry) => {
    addCollectionStats(safeProfile.stats, entry);

    const credits =
      entry?.restaurantCredits && typeof entry.restaurantCredits === "object" && !Array.isArray(entry.restaurantCredits)
        ? entry.restaurantCredits
        : {};
    Object.values(credits).forEach((credit) => {
      const restaurantSlug = normalizeRestaurantSlug(credit?.restaurantSlug || "");
      if (!restaurantSlug) {
        return;
      }
      const stats = nextRestaurantStats[restaurantSlug] || emptyStats();
      addCollectionStats(stats, {
        ...entry,
        customerValue: Number(credit.customerValue) || 0,
        regularValue: Number(credit.regularValue) || Number(entry.regularValue) || 0,
        occasionalValue: Number(credit.occasionalValue) || Number(entry.occasionalValue) || 0,
      }, credit.status);
      nextRestaurantStats[restaurantSlug] = stats;
    });
  });

  safeProfile.restaurantStats = nextRestaurantStats;
  return safeProfile;
}

function applySessionToProfile(profile, session) {
  const safeProfile = normalizeProfile(profile);
  const restaurantSlug = normalizeRestaurantSlug(session.restaurantSlug || "");
  const customerId = String(session.customer?.id || session.customerId || "").trim();
  if (!restaurantSlug) {
    return safeProfile;
  }

  const previousEarnedPoints = earnedPointTotal(safeProfile);
  const alreadyRecorded = safeProfile.recentSessions.some((recentSession) => recentSession?.id === session.id);
  const completedAt = String(session.completedAt || new Date().toISOString());
  const result = ["favorite", "regular", "occasional"].includes(session.result) ? session.result : "occasional";
  const regularValue = Number(session.customerBaseValues?.regularValue) || Number(session.customer?.regularValue) || 0;
  const occasionalValue = Number(session.customerBaseValues?.occasionalValue) || Number(session.customer?.occasionalValue) || 0;
  const customerValue = Math.max(0, Number(session.customerValue) || valueForStatus({ regularValue, occasionalValue }, result));

  if (!alreadyRecorded) {
    const stats = safeProfile.restaurantStats[restaurantSlug] || emptyStats();
    stats.gamesPlayed += 1;
    stats.totalCorrectAnswers += Number(session.score) || 0;
    safeProfile.restaurantStats[restaurantSlug] = stats;
    safeProfile.stats.gamesPlayed += 1;
    safeProfile.stats.totalCorrectAnswers += Number(session.score) || 0;
    safeProfile.recentSessions = [
      {
        id: session.id,
        restaurantSlug,
        restaurantName: String(session.restaurantName || ""),
        customerId,
        customerName: String(session.customer?.name || session.customerName || ""),
        customerImage: String(session.customer?.image || ""),
        customerBio: String(session.customer?.bio || ""),
        score: Number(session.score) || 0,
        totalQuestions: Array.isArray(session.questions) ? session.questions.length : 10,
        result,
        customerValue,
        salesBoostPercent: Math.max(0, Number(session.salesBoostPercent) || 0),
        customerBaseValues: session.customerBaseValues || null,
        scoringVersion: String(session.scoringVersion || ""),
        playedAt: completedAt,
        completed: true,
      },
      ...safeProfile.recentSessions,
    ].slice(0, 250);
  }

  if (!customerId || session.result === "lost") {
    return safeProfile;
  }

  const existingIndex = safeProfile.customerCollection.findIndex((entry) => entry?.customerId === customerId);
  const existingEntry = existingIndex >= 0 ? safeProfile.customerCollection[existingIndex] : null;
  const nextCredit = {
    restaurantSlug,
    restaurantName: String(session.restaurantName || ""),
    status: result,
    customerValue,
    regularValue,
    occasionalValue,
    bestScore: Number(session.score) || 0,
    dateWon: completedAt,
  };

  const nextEntry = {
    ...(existingEntry || {}),
    id: existingEntry?.id || `collection-${customerId}`,
    customerId,
    customerName: String(session.customer?.name || existingEntry?.customerName || ""),
    status:
      statusRank(result) > statusRank(existingEntry?.status)
        ? result
        : existingEntry?.status || result,
    restaurantSlug,
    restaurantName: String(session.restaurantName || existingEntry?.restaurantName || ""),
    rarity: String(session.customer?.rarity || existingEntry?.rarity || ""),
    regularValue,
    occasionalValue,
    customerValue: Math.max(Number(existingEntry?.customerValue) || 0, customerValue),
    bestScore: Math.max(Number(existingEntry?.bestScore) || 0, Number(session.score) || 0),
    scoringVersion: String(session.scoringVersion || existingEntry?.scoringVersion || ""),
    salesBoostPercent: Math.max(0, Number(session.salesBoostPercent) || Number(existingEntry?.salesBoostPercent) || 0),
    favoriteVisits: Number(existingEntry?.favoriteVisits) || 0,
    restaurantCredits: {
      ...(existingEntry?.restaurantCredits || {}),
      [restaurantSlug]: mergeRestaurantCredit(existingEntry?.restaurantCredits?.[restaurantSlug], nextCredit),
    },
    image: String(session.customer?.image || existingEntry?.image || ""),
    bio: String(session.customer?.bio || existingEntry?.bio || ""),
    dateWon: completedAt,
  };

  safeProfile.customerCollection = safeProfile.customerCollection.filter((entry) => entry?.customerId !== customerId);
  safeProfile.customerCollection.unshift(nextEntry);

  const rebuiltProfile = rebuildProfileCollectionStats(safeProfile);
  const cashEarned = Math.max(0, earnedPointTotal(rebuiltProfile) - previousEarnedPoints);
  const economy = rebuiltProfile.restaurantEconomy || {};
  if (cashEarned > 0 && (economy.cashOnHand || economy.lifetimeCashEarned || economy.expansionLevel || economy.upgrades)) {
    rebuiltProfile.restaurantEconomy = {
      ...economy,
      cashOnHand: Math.max(0, Number(economy.cashOnHand) || 0) + cashEarned,
      lifetimeCashEarned: Math.max(Number(economy.lifetimeCashEarned) || 0, previousEarnedPoints) + cashEarned,
    };
  }

  return rebuiltProfile;
}

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    const url = new URL(request.url);
    const profileId = String(url.searchParams.get("profileId") || "").trim();
    return jsonResponse(await fetchSessions(profileId));
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
    return jsonResponse({ ok: false, error: "Expected a JSON session object." }, 400);
  }

  if (!String(body.id || "").trim()) {
    return jsonResponse({ ok: false, error: "Session id is required." }, 400);
  }

  try {
    const profileId = String(body.profileId || "").trim();
    const profile = profileId ? await fetchProfile(profileId) : null;
    const token = getProfileAccessToken(request);
    if (!profile || !token || !profileTokenMatches(profile, token)) {
      return jsonResponse({ ok: false, error: "Unable to verify this restaurant." }, 403);
    }
    const savedSession = await upsertSession(body);
    const updatedProfile = applySessionToProfile(profile, savedSession);
    await storeProfile(updatedProfile, {
      profileAccessTokenHash: profile.profileAccessTokenHash,
      ownerUserId: profile.ownerUserId,
      ownerEmail: profile.ownerEmail,
      ownershipUpdatedAt: profile.ownershipUpdatedAt,
    });
    return jsonResponse(savedSession, 201);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
