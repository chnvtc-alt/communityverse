import { buildLeaderboard, normalizeRestaurantSlug, profileFromRecord, sessionFromRecord } from "./_lib/restaurant-data.mjs";
import { fetchRestaurantsFromSupabase } from "./_lib/restaurant-admin.mjs";
import { hasSupabaseConfig, jsonResponse, supabaseRequest, supabaseRequestAll } from "./_lib/supabase.mjs";

const LEADERBOARD_CACHE_TTL_MS = 30000;
const PROFILE_ID_FILTER_LIMIT = 150;
const leaderboardCache = new Map();

function restaurantSlugQueryValues(restaurantSlug) {
  const normalizedSlug = normalizeRestaurantSlug(restaurantSlug);
  const values = new Set([String(restaurantSlug || "").trim(), normalizedSlug].filter(Boolean));
  if (normalizedSlug === "cinema-tavern") {
    values.add("cinematavern");
    values.add("cinema-tavern");
  }
  return [...values];
}

function inFilter(values) {
  return `in.(${values.map((value) => encodeURIComponent(value)).join(",")})`;
}

async function fetchProfiles(profileIds = []) {
  const idFilter = profileIds.length ? `&id=${inFilter(profileIds)}` : "";
  const rows = await supabaseRequest(`profiles?select=id,player_name,restaurant_name,restaurant_slug,is_guest,created_at,updated_at,payload_json${idFilter}&order=updated_at.desc`);
  return Array.isArray(rows) ? rows.map(profileFromRecord).filter(Boolean) : [];
}

async function fetchSessionStatsByProfile(restaurantSlug = "") {
  const slugValues = restaurantSlugQueryValues(restaurantSlug);
  const restaurantFilter = slugValues.length ? `&restaurant_slug=${inFilter(slugValues)}` : "";
  const rows = await supabaseRequestAll(
    `sessions?select=id,profile_id,restaurant_slug,completed_at,payload_json${restaurantFilter}&order=completed_at.desc`
  );
  const statsByProfile = {};
  const profileIds = new Set();
  const seenSessionIds = new Set();
  (Array.isArray(rows) ? rows : []).map(sessionFromRecord).filter(Boolean).forEach((session) => {
    const sessionId = String(session.id || "").trim();
    const profileId = String(session.profileId || "").trim();
    const restaurantSlug = normalizeRestaurantSlug(session.restaurantSlug || "");
    if (!profileId || !restaurantSlug || (sessionId && seenSessionIds.has(sessionId))) {
      return;
    }
    if (sessionId) {
      seenSessionIds.add(sessionId);
    }
    profileIds.add(profileId);

    statsByProfile[profileId] = statsByProfile[profileId] || {};
    const stats = statsByProfile[profileId][restaurantSlug] || {
      gamesPlayed: 0,
      totalCorrectAnswers: 0,
      regularCustomers: 0,
      favoriteCustomers: 0,
      occasionalCustomers: 0,
      lostCustomers: 0,
      totalCustomerValue: 0,
      estimatedSales: 0,
      customerCredits: {},
    };
    stats.gamesPlayed += 1;
    stats.totalCorrectAnswers += Number(session.score) || 0;
    const customerId = String(session.customer?.id || session.customerId || "").trim();
    const creditKey = customerId || sessionId;
    const result = ["favorite", "regular", "occasional", "lost"].includes(session.result)
      ? session.result
      : "";
    const customerValue = Math.max(0, Number(session.customerValue) || 0);
    if (creditKey && result && result !== "lost" && customerValue > 0) {
      const existingCredit = stats.customerCredits[creditKey] || { status: "", customerValue: 0 };
      const nextCustomerValue = Math.max(Number(existingCredit.customerValue) || 0, customerValue);
      stats.customerCredits[creditKey] = {
        status: result === "favorite" || existingCredit.status === "favorite"
          ? "favorite"
          : result === "regular" || existingCredit.status === "regular"
            ? "regular"
            : "occasional",
        customerValue: nextCustomerValue,
      };
      const credits = Object.values(stats.customerCredits);
      stats.regularCustomers = credits.filter((credit) => credit.status === "regular" || credit.status === "favorite").length;
      stats.favoriteCustomers = credits.filter((credit) => credit.status === "favorite").length;
      stats.occasionalCustomers = credits.filter((credit) => credit.status === "occasional").length;
      stats.lostCustomers = 0;
      stats.totalCustomerValue = credits.reduce((total, credit) => total + Math.max(0, Number(credit.customerValue) || 0), 0);
      stats.estimatedSales = stats.totalCustomerValue;
    }
    statsByProfile[profileId][restaurantSlug] = stats;
  });

  Object.values(statsByProfile).forEach((profileStats) => {
    Object.values(profileStats).forEach((stats) => {
      delete stats.customerCredits;
    });
  });

  return {
    statsByProfile,
    profileIds: [...profileIds],
  };
}

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    const url = new URL(request.url);
    const metric = String(url.searchParams.get("metric") || "estimatedSales");
    const restaurantSlug = String(url.searchParams.get("restaurantSlug") || "");
    const cacheKey = `${metric}|${normalizeRestaurantSlug(restaurantSlug) || "overall"}`;
    const cached = leaderboardCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < LEADERBOARD_CACHE_TTL_MS) {
      return jsonResponse(cached.rows);
    }

    const { statsByProfile: sessionStatsByProfile, profileIds } = await fetchSessionStatsByProfile(restaurantSlug);
    const shouldFilterProfiles = restaurantSlug && profileIds.length <= PROFILE_ID_FILTER_LIMIT;
    const profiles = restaurantSlug && !profileIds.length
      ? []
      : await fetchProfiles(shouldFilterProfiles ? profileIds : []);
    const restaurants = await fetchRestaurantsFromSupabase();
    const publicRestaurantSlugs = restaurants
      .filter((restaurant) => restaurant.visibleInList !== false)
      .map((restaurant) => restaurant.slug);

    const rows = buildLeaderboard(profiles, metric, restaurantSlug, {
      publicRestaurantSlugs,
      sessionStatsByProfile,
    });
    leaderboardCache.set(cacheKey, {
      createdAt: Date.now(),
      rows,
    });
    return jsonResponse(rows);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
