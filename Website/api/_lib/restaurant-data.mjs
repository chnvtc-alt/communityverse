export function emptyStats() {
  return {
    gamesPlayed: 0,
    totalCorrectAnswers: 0,
    regularCustomers: 0,
    occasionalCustomers: 0,
    lostCustomers: 0,
    totalCustomerValue: 0,
    estimatedSales: 0,
  };
}

export function normalizeProfile(profile) {
  const safeProfile = typeof profile === "object" && profile ? structuredClone(profile) : {};
  safeProfile.id = String(safeProfile.id || "");
  safeProfile.playerName = String(safeProfile.playerName || "").trim();
  safeProfile.restaurantName = String(safeProfile.restaurantName || "").trim();
  safeProfile.restaurantSlug = String(safeProfile.restaurantSlug || "").trim();
  safeProfile.createdAt = String(safeProfile.createdAt || "");
  safeProfile.updatedAt = String(safeProfile.updatedAt || "");
  safeProfile.lastPlayedAt = String(safeProfile.lastPlayedAt || "");
  safeProfile.isGuest = Boolean(safeProfile.isGuest);
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

function restaurantStatsFor(profile, restaurantSlug) {
  const safeProfile = normalizeProfile(profile);
  if (!restaurantSlug) {
    return safeProfile.stats;
  }

  return safeProfile.restaurantStats[restaurantSlug] || emptyStats();
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

  if (metric === "regularCustomers") {
    return stats.regularCustomers;
  }

  if (metric === "collected") {
    return stats.regularCustomers + stats.occasionalCustomers;
  }

  return stats.estimatedSales;
}

export function buildLeaderboard(profiles, metric = "estimatedSales", restaurantSlug = "") {
  return (Array.isArray(profiles) ? profiles : [])
    .map(normalizeProfile)
    .filter((profile) => !profile.isGuest)
    .map((profile) => {
      const stats = restaurantStatsFor(profile, restaurantSlug);
      const accuracy = stats.gamesPlayed ? (stats.totalCorrectAnswers / (stats.gamesPlayed * 10)) * 100 : 0;
      const value = leaderboardValue(stats, metric);

      return {
        profileId: profile.id,
        playerName: profile.playerName,
        restaurantName: profile.restaurantName,
        stats,
        accuracy,
        rating: accuracy / 20,
        value,
      };
    })
    .filter((entry) => (restaurantSlug ? entry.stats.gamesPlayed > 0 : true))
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
