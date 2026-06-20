export function emptyStats() {
  return {
    gamesPlayed: 0,
    totalCorrectAnswers: 0,
    regularCustomers: 0,
    favoriteCustomers: 0,
    occasionalCustomers: 0,
    lostCustomers: 0,
    totalCustomerValue: 0,
    estimatedSales: 0,
    restaurantValue: 0,
  };
}

const EXPANSION_LEVELS = [
  {
    id: "food-truck",
    label: "Food Truck",
    cost: 0,
    value: 500,
  },
  {
    id: "counter-service",
    label: "Counter Service",
    cost: 500,
    value: 1500,
  },
  {
    id: "small-diner",
    label: "Small Diner",
    cost: 1500,
    value: 4500,
  },
  {
    id: "family-restaurant",
    label: "Family Restaurant",
    cost: 3000,
    value: 10500,
  },
  {
    id: "regional-favorite",
    label: "Regional Favorite",
    cost: 7500,
    value: 25500,
  },
  {
    id: "local-landmark",
    label: "Local Landmark",
    cost: 15000,
    value: 55500,
  },
];

const DEFAULT_EXPANSION_LEVEL = EXPANSION_LEVELS[0].id;
const RECENT_PERFORMANCE_DAYS = 30;
const RECENT_PERFORMANCE_VALUE_RATE = 0.25;

function normalizeRestaurantSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeRestaurantEconomy(economy) {
  const safeEconomy = economy && typeof economy === "object" ? { ...economy } : {};
  const expansionLevel = EXPANSION_LEVELS.some((level) => level.id === safeEconomy.expansionLevel)
    ? safeEconomy.expansionLevel
    : DEFAULT_EXPANSION_LEVEL;

  return {
    cashOnHand: Math.max(0, Number(safeEconomy.cashOnHand) || 0),
    lifetimeCashEarned: Math.max(0, Number(safeEconomy.lifetimeCashEarned) || 0),
    expansionLevel,
    upgrades:
      safeEconomy.upgrades && typeof safeEconomy.upgrades === "object" && !Array.isArray(safeEconomy.upgrades)
        ? { ...safeEconomy.upgrades }
        : {},
  };
}

function getExpansionValue(economy) {
  const expansion = EXPANSION_LEVELS.find((level) => level.id === economy.expansionLevel) || EXPANSION_LEVELS[0];
  return Number(expansion.value) || 0;
}

function getUpgradeValue(economy) {
  return Object.values(economy.upgrades || {}).reduce((total, upgrade) => {
    if (!upgrade || typeof upgrade !== "object") {
      return total;
    }
    return total + Math.max(0, Number(upgrade.value ?? upgrade.cost) || 0);
  }, 0);
}

function hasTrackedRestaurantEconomy(economy) {
  const safeEconomy = normalizeRestaurantEconomy(economy);
  return Boolean(
    safeEconomy.cashOnHand ||
      safeEconomy.lifetimeCashEarned ||
      safeEconomy.expansionLevel !== DEFAULT_EXPANSION_LEVEL ||
      Object.keys(safeEconomy.upgrades || {}).length
  );
}

function getRestaurantCashOnHand(profile, stats = null) {
  const safeStats = stats || profile?.stats || {};
  const economy = normalizeRestaurantEconomy(profile?.restaurantEconomy);
  const restaurantStatsSales = Object.values(profile?.restaurantStats || {}).reduce(
    (total, restaurantStats) => total + Math.max(0, Number(restaurantStats?.estimatedSales) || 0),
    0
  );
  return hasTrackedRestaurantEconomy(economy)
    ? economy.cashOnHand
    : Math.max(
        0,
        Number(safeStats.estimatedSales) || 0,
        Number(profile?.stats?.estimatedSales) || 0,
        restaurantStatsSales
      );
}

function getCustomerLoyaltyValue(stats) {
  const favoriteCustomers = Math.max(0, Number(stats.favoriteCustomers) || 0);
  const regularOnlyCustomers = Math.max(0, (Number(stats.regularCustomers) || 0) - favoriteCustomers);
  return regularOnlyCustomers * 100 + favoriteCustomers * 300;
}

function getRatingMultiplier(stats) {
  if (!stats.gamesPlayed) {
    return 0;
  }
  const accuracy = (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100;
  const rating = Math.round((accuracy / 20) * 10) / 10;
  return rating / 200;
}

function getRatingValue(stats, baseValue = 0) {
  return Math.round(Math.max(0, Number(baseValue) || 0) * getRatingMultiplier(stats));
}

function favoriteCustomerValue(value) {
  return Math.round((Number(value) || 0) * 1.2);
}

function entryValueForStatus(entry, status) {
  if (status === "favorite") {
    return favoriteCustomerValue(entry.regularValue);
  }
  if (status === "regular") {
    return Number(entry.regularValue) || 0;
  }
  if (status === "occasional") {
    return Number(entry.occasionalValue) || 0;
  }
  return 0;
}

function getRecentPerformanceValue(profile, restaurantSlug = "", publicRestaurantSlugs = null) {
  const cutoff = Date.now() - RECENT_PERFORMANCE_DAYS * 24 * 60 * 60 * 1000;
  const sessions = Array.isArray(profile?.recentSessions) ? profile.recentSessions : [];
  const collection = Array.isArray(profile?.customerCollection) ? profile.customerCollection : [];

  return sessions.reduce((total, session) => {
    const playedAt = Date.parse(session?.playedAt || "");
    const sessionRestaurantSlug = String(session?.restaurantSlug || "").trim();
    if (!playedAt || playedAt < cutoff) {
      return total;
    }
    if (restaurantSlug && sessionRestaurantSlug !== restaurantSlug) {
      return total;
    }
    if (!restaurantSlug && publicRestaurantSlugs && sessionRestaurantSlug && !publicRestaurantSlugs.has(sessionRestaurantSlug)) {
      return total;
    }

    const status = ["regular", "occasional", "favorite"].includes(session.result)
      ? session.result
      : "";
    const entry = collection.find((item) => item?.customerId === session.customerId);
    const sessionValue = Math.max(0, Number(session.customerValue) || 0);
    return entry && status ? total + (sessionValue || entryValueForStatus(entry, status)) : total;
  }, 0);
}

function getRestaurantValue(profile, stats, restaurantSlug = "", publicRestaurantSlugs = null) {
  const economy = normalizeRestaurantEconomy(profile?.restaurantEconomy);
  const expansionValue = getExpansionValue(economy);
  const upgradeValue = getUpgradeValue(economy);
  const loyaltyValue = getCustomerLoyaltyValue(stats);
  const recentPerformanceValue = Math.round(
    getRecentPerformanceValue(profile, restaurantSlug, publicRestaurantSlugs) *
      RECENT_PERFORMANCE_VALUE_RATE
  );
  const valueBeforeRating = expansionValue + upgradeValue + loyaltyValue + recentPerformanceValue;
  const ratingValue = getRatingValue(stats, valueBeforeRating);
  return Math.round(valueBeforeRating + ratingValue);
}

export function normalizeProfile(profile) {
  const safeProfile = typeof profile === "object" && profile ? structuredClone(profile) : {};
  safeProfile.id = String(safeProfile.id || "");
  safeProfile.playerName = String(safeProfile.playerName || "").trim();
  safeProfile.restaurantName = String(safeProfile.restaurantName || "").trim();
  safeProfile.restaurantSlug = String(safeProfile.restaurantSlug || "").trim();
  safeProfile.restaurantNameUpdatedAt = String(safeProfile.restaurantNameUpdatedAt || "").trim();
  safeProfile.createdAt = String(safeProfile.createdAt || "");
  safeProfile.updatedAt = String(safeProfile.updatedAt || "");
  safeProfile.lastPlayedAt = String(safeProfile.lastPlayedAt || "");
  safeProfile.baseRestaurantSlug = normalizeRestaurantSlug(safeProfile.baseRestaurantSlug || "");
  safeProfile.baseRestaurantName = String(safeProfile.baseRestaurantName || "").trim();
  safeProfile.isGuest = Boolean(safeProfile.isGuest);
  safeProfile.emailConnected = Boolean(safeProfile.emailConnected);
  safeProfile.restaurantEconomy = normalizeRestaurantEconomy(safeProfile.restaurantEconomy);
  safeProfile.stats = { ...emptyStats(), ...(safeProfile.stats || {}) };
  safeProfile.restaurantStats =
    safeProfile.restaurantStats && typeof safeProfile.restaurantStats === "object"
      ? safeProfile.restaurantStats
      : {};
  safeProfile.customerCollection = Array.isArray(safeProfile.customerCollection)
    ? safeProfile.customerCollection
    : [];
  safeProfile.recentSessions = Array.isArray(safeProfile.recentSessions)
    ? safeProfile.recentSessions
    : [];
  return safeProfile;
}

function toJsonObject(value, fallback = {}) {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return fallback;
}

export function profileFromRecord(record) {
  if (!record) {
    return null;
  }

  const payload = toJsonObject(record.payload_json, {});
  return normalizeProfile({
    ...payload,
    id: record.id ?? payload.id,
    playerName: record.player_name ?? payload.playerName,
    restaurantName: record.restaurant_name ?? payload.restaurantName,
    restaurantSlug: record.restaurant_slug ?? payload.restaurantSlug,
    isGuest: record.is_guest ?? payload.isGuest,
    createdAt: record.created_at ?? payload.createdAt,
    updatedAt: record.updated_at ?? payload.updatedAt,
  });
}

export function sessionFromRecord(record) {
  if (!record) {
    return null;
  }

  const payload = toJsonObject(record.payload_json, {});
  return {
    ...payload,
    id: record.id ?? payload.id,
    profileId: record.profile_id ?? payload.profileId,
    restaurantSlug: record.restaurant_slug ?? payload.restaurantSlug,
    completedAt: record.completed_at ?? payload.completedAt,
  };
}

export function normalizeQuestion(question) {
  const safeQuestion = typeof question === "object" && question ? structuredClone(question) : {};
  safeQuestion.id = String(safeQuestion.id || "").trim();
  safeQuestion.scope = String(safeQuestion.scope || "").trim();
  safeQuestion.restaurantSlug = String(safeQuestion.restaurantSlug || "").trim();
  safeQuestion.areaSlug = String(safeQuestion.areaSlug || "").trim();
  safeQuestion.prompt = String(safeQuestion.prompt || "").trim();
  safeQuestion.correctAnswer = String(safeQuestion.correctAnswer || "").trim();
  safeQuestion.wrongAnswers = Array.isArray(safeQuestion.wrongAnswers)
    ? safeQuestion.wrongAnswers.map((answer) => String(answer || "").trim()).filter(Boolean)
    : [];
  safeQuestion.tags = Array.isArray(safeQuestion.tags)
    ? safeQuestion.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
    : [];
  safeQuestion.customerIds = Array.isArray(safeQuestion.customerIds)
    ? safeQuestion.customerIds.map((customerId) => String(customerId || "").trim()).filter(Boolean)
    : [];
  safeQuestion.difficulty = String(safeQuestion.difficulty || "medium").trim() || "medium";
  safeQuestion.image = String(safeQuestion.image || "").trim();
  safeQuestion.imageAlt = String(safeQuestion.imageAlt || "").trim();
  safeQuestion.imagePrompt = String(safeQuestion.imagePrompt || "").trim();
  safeQuestion.active = safeQuestion.active !== false;
  safeQuestion.sortOrder = Number(safeQuestion.sortOrder) || 0;
  return safeQuestion;
}

export function questionFromRecord(record) {
  if (!record) {
    return null;
  }

  const payload = toJsonObject(record.payload_json, {});
  return normalizeQuestion({
    ...payload,
    id: record.id ?? payload.id,
    active: record.active ?? payload.active,
    scope: record.scope ?? payload.scope,
    restaurantSlug: record.restaurant_slug ?? payload.restaurantSlug,
    areaSlug: record.area_slug ?? payload.areaSlug,
    difficulty: record.difficulty ?? payload.difficulty,
    tags: record.tags ?? payload.tags,
    customerIds: record.customer_ids ?? payload.customerIds,
    sortOrder: record.sort_order ?? payload.sortOrder,
    createdAt: record.created_at ?? payload.createdAt,
    updatedAt: record.updated_at ?? payload.updatedAt,
  });
}

export function questionToRecord(question, sortOrder = 0) {
  const normalized = normalizeQuestion(question);
  const timestamp = new Date().toISOString();

  return {
    id: normalized.id,
    active: normalized.active,
    sort_order: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : normalized.sortOrder || 0,
    created_at: normalized.createdAt || timestamp,
    updated_at: timestamp,
    payload_json: normalized,
  };
}

function restaurantStatsFor(profile, restaurantSlug) {
  const safeProfile = normalizeProfile(profile);
  if (!restaurantSlug) {
    return safeProfile.stats;
  }

  return safeProfile.restaurantStats[restaurantSlug] || emptyStats();
}

function addStats(target, source) {
  target.gamesPlayed += Number(source.gamesPlayed) || 0;
  target.totalCorrectAnswers += Number(source.totalCorrectAnswers) || 0;
  target.regularCustomers += Number(source.regularCustomers) || 0;
  target.favoriteCustomers += Number(source.favoriteCustomers) || 0;
  target.occasionalCustomers += Number(source.occasionalCustomers) || 0;
  target.lostCustomers += Number(source.lostCustomers) || 0;
  target.totalCustomerValue += Number(source.totalCustomerValue) || 0;
  target.estimatedSales += Number(source.estimatedSales) || 0;
}

function publicOverallStatsFor(profile, publicRestaurantSlugs) {
  const safeProfile = normalizeProfile(profile);
  const entries = Object.entries(safeProfile.restaurantStats || {});

  if (!entries.length) {
    const stats = { ...emptyStats(), ...(safeProfile.stats || {}) };
    stats.restaurantValue = getRestaurantValue(safeProfile, stats, "", publicRestaurantSlugs);
    stats.netWorth = stats.restaurantValue + getRestaurantCashOnHand(safeProfile, safeProfile.stats);
    return stats;
  }

  const stats = entries.reduce((combinedStats, [restaurantSlug, restaurantStats]) => {
    if (publicRestaurantSlugs.has(restaurantSlug)) {
      addStats(combinedStats, restaurantStats);
    }

    return combinedStats;
  }, emptyStats());

  stats.restaurantValue = getRestaurantValue(safeProfile, stats, "", publicRestaurantSlugs);
  stats.netWorth = stats.restaurantValue + getRestaurantCashOnHand(safeProfile, safeProfile.stats);
  return stats;
}

export function leaderboardValue(stats, metric) {
  const accuracy = stats.gamesPlayed ? (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100 : 0;

  if (metric === "rating") {
    return accuracy / 20;
  }

  if (metric === "accuracy") {
    return accuracy;
  }

  if (metric === "gamesPlayed") {
    return stats.gamesPlayed;
  }

  if (metric === "restaurantValue") {
    return stats.restaurantValue;
  }

  if (metric === "netWorth") {
    return stats.netWorth || stats.restaurantValue || 0;
  }

  if (metric === "regularCustomers") {
    return stats.regularCustomers;
  }

  if (metric === "collected") {
    return stats.regularCustomers + stats.occasionalCustomers;
  }

  return stats.estimatedSales;
}

export function buildLeaderboard(profiles, metric = "estimatedSales", restaurantSlug = "", options = {}) {
  const publicRestaurantSlugs = options.publicRestaurantSlugs
    ? new Set(options.publicRestaurantSlugs)
    : null;

  return (Array.isArray(profiles) ? profiles : [])
    .map(normalizeProfile)
    .map((profile) => {
      const stats = restaurantSlug
        ? publicRestaurantSlugs && !publicRestaurantSlugs.has(restaurantSlug)
          ? emptyStats()
          : restaurantStatsFor(profile, restaurantSlug)
        : publicRestaurantSlugs
          ? publicOverallStatsFor(profile, publicRestaurantSlugs)
          : restaurantStatsFor(profile, "");
      const accuracy = stats.gamesPlayed ? (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100 : 0;
      const restaurantValueStats =
        metric === "restaurantValue" || metric === "netWorth"
          ? publicRestaurantSlugs
            ? publicOverallStatsFor(profile, publicRestaurantSlugs)
            : restaurantStatsFor(profile, "")
          : stats;
      const value = leaderboardValue(metric === "restaurantValue" || metric === "netWorth" ? restaurantValueStats : stats, metric);
      if ((metric === "restaurantValue" || metric === "netWorth") && !restaurantValueStats.restaurantValue) {
        restaurantValueStats.restaurantValue = getRestaurantValue(
          profile,
          restaurantValueStats,
          "",
          publicRestaurantSlugs
        );
      }
      if (metric === "netWorth" && !restaurantValueStats.netWorth) {
        restaurantValueStats.netWorth =
          restaurantValueStats.restaurantValue + getRestaurantCashOnHand(profile, profile.stats);
      }

      return {
        profileId: profile.id,
        playerName: profile.playerName,
        restaurantName: profile.restaurantName,
        stats,
        accuracy,
        rating: accuracy / 20,
        value: metric === "restaurantValue"
          ? restaurantValueStats.restaurantValue
          : metric === "netWorth"
            ? restaurantValueStats.netWorth
            : value,
      };
    })
    .filter((entry) => entry.stats.gamesPlayed > 0)
    .sort((left, right) => {
      if (right.value !== left.value) {
        return right.value - left.value;
      }

      return left.playerName.localeCompare(right.playerName);
    })
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
}
