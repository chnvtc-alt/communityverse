const BLOCKED_RESTAURANT_NAMES = [
  "applebees",
  "arbys",
  "burger king",
  "buffalo wild wings",
  "cheesecake factory",
  "chick fil a",
  "chickfila",
  "chipotle",
  "cracker barrel",
  "dairy queen",
  "dennys",
  "dominos",
  "five guys",
  "ihop",
  "in n out",
  "kfc",
  "little caesars",
  "mcdonalds",
  "mc donalds",
  "olive garden",
  "outback steakhouse",
  "panera",
  "panda express",
  "pizza hut",
  "popeyes",
  "red lobster",
  "sonic",
  "starbucks",
  "subway",
  "taco bell",
  "texas roadhouse",
  "wendys",
  "waffle house",
  "americana diner",
  "waffle master",
];

const BLOCKED_RESTAURANT_NAME_WORDS = [
  "asshole",
  "bastard",
  "bitch",
  "crap",
  "damn",
  "dick",
  "fart",
  "fuck",
  "hell",
  "piss",
  "porn",
  "shit",
  "slut",
  "whore",
];

export function normalizeRestaurantNameText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compactRestaurantNameText(value) {
  return normalizeRestaurantNameText(value).replace(/[^a-z0-9]+/g, "");
}

export function isRestaurantNameBlocked(name) {
  const normalized = normalizeRestaurantNameText(name);
  const compact = compactRestaurantNameText(name);
  if (!normalized) {
    return false;
  }

  return (
    BLOCKED_RESTAURANT_NAMES.some((blocked) => {
      const normalizedBlocked = normalizeRestaurantNameText(blocked);
      const compactBlocked = compactRestaurantNameText(blocked);
      return (
        normalized === normalizedBlocked ||
        normalized.includes(normalizedBlocked) ||
        compact === compactBlocked ||
        compact.includes(compactBlocked)
      );
    }) ||
    BLOCKED_RESTAURANT_NAME_WORDS.some((blocked) => {
      const normalizedBlocked = normalizeRestaurantNameText(blocked);
      return normalized.split(" ").includes(normalizedBlocked);
    })
  );
}

export function validateRestaurantProfileName(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return "Restaurant name is required.";
  }
  if (trimmed.length > 64) {
    return "Restaurant name must be 64 characters or shorter.";
  }
  if (isRestaurantNameBlocked(trimmed)) {
    return "That restaurant name is blocked. Please choose a fictional name instead.";
  }
  return "";
}
