import { supabaseRequest } from "./supabase.mjs";

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

export function slugifyRestaurant(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function normalizeSurveyQuestion(question, index = 0) {
  const safeQuestion = typeof question === "object" && question ? structuredClone(question) : {};
  const type = ["rating", "yesno", "choice", "text"].includes(safeQuestion.type)
    ? safeQuestion.type
    : "rating";
  const choices = Array.isArray(safeQuestion.choices)
    ? safeQuestion.choices.map((choice) => String(choice || "").trim()).filter(Boolean)
    : [];

  return {
    id: String(safeQuestion.id || "").trim() || `survey-question-${index + 1}`,
    type,
    prompt: String(safeQuestion.prompt || "").trim(),
    choices: type === "choice" ? choices.slice(0, 8) : [],
    required: safeQuestion.required !== false,
    active: safeQuestion.active !== false,
    sortOrder: Number.isFinite(Number(safeQuestion.sortOrder)) ? Number(safeQuestion.sortOrder) : index,
  };
}

function normalizeSurveyQuestions(questions = []) {
  return (Array.isArray(questions) ? questions : [])
    .map(normalizeSurveyQuestion)
    .filter((question) => question.prompt)
    .sort((left, right) => (Number(left.sortOrder) || 0) - (Number(right.sortOrder) || 0));
}

const QUESTION_MIX_SLOT_COUNT = 10;
const QUESTION_MIX_SLOT_TYPES = new Set(["auto", "random", "food", "restaurant", "area", "character", "tag"]);

function normalizeQuestionMixSlot(slot, index = 0) {
  const safeSlot = typeof slot === "object" && slot ? structuredClone(slot) : {};
  const type = QUESTION_MIX_SLOT_TYPES.has(String(safeSlot.type || "").trim())
    ? String(safeSlot.type || "").trim()
    : "auto";

  return {
    type,
    tag: type === "tag" ? slugifyRestaurant(safeSlot.tag || "") : "",
    sortOrder: Number.isFinite(Number(safeSlot.sortOrder)) ? Number(safeSlot.sortOrder) : index,
  };
}

function normalizeQuestionMix(questionMix) {
  const safeMix = typeof questionMix === "object" && questionMix ? structuredClone(questionMix) : {};
  const rawSlots = Array.isArray(safeMix.slots) ? safeMix.slots : [];
  return {
    enabled: safeMix.enabled === true,
    slots: Array.from({ length: QUESTION_MIX_SLOT_COUNT }, (_, index) =>
      normalizeQuestionMixSlot(rawSlots[index], index)
    ),
  };
}

function normalizeThemeTags(value) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || "").split(",");
  return [...new Set(rawValues.map(slugifyRestaurant).filter(Boolean))];
}

export function normalizeRestaurant(restaurant) {
  const safeRestaurant = typeof restaurant === "object" && restaurant ? structuredClone(restaurant) : {};
  const slug = slugifyRestaurant(safeRestaurant.slug || safeRestaurant.name);

  safeRestaurant.id = String(safeRestaurant.id || slug).trim();
  safeRestaurant.slug = slug;
  safeRestaurant.name = String(safeRestaurant.name || "").trim();
  safeRestaurant.publicGameName = String(
    safeRestaurant.publicGameName || safeRestaurant.public_game_name || ""
  ).trim();
  safeRestaurant.location = String(safeRestaurant.location || "").trim();
  safeRestaurant.areaSlug = slugifyRestaurant(safeRestaurant.areaSlug || safeRestaurant.area_slug || "");
  safeRestaurant.themeTags = normalizeThemeTags(safeRestaurant.themeTags || safeRestaurant.theme_tags || "");
  safeRestaurant.description = String(safeRestaurant.description || "").trim();
  safeRestaurant.heroImage = String(safeRestaurant.heroImage || safeRestaurant.hero_image || "").trim();
  safeRestaurant.logoSquare = String(safeRestaurant.logoSquare || safeRestaurant.logo_square || "").trim();
  safeRestaurant.logoHorizontal = String(
    safeRestaurant.logoHorizontal || safeRestaurant.logo_horizontal || safeRestaurant.logoSquare || ""
  ).trim();
  safeRestaurant.squareImage = String(safeRestaurant.squareImage || safeRestaurant.logoSquare || "").trim();
  safeRestaurant.primaryColor = String(safeRestaurant.primaryColor || safeRestaurant.primary_color || "").trim();
  safeRestaurant.secondaryColor = String(safeRestaurant.secondaryColor || safeRestaurant.secondary_color || "").trim();
  safeRestaurant.accentColor = String(safeRestaurant.accentColor || safeRestaurant.accent_color || "").trim();
  safeRestaurant.openingCopy = String(safeRestaurant.openingCopy || safeRestaurant.opening_copy || "").trim();
  safeRestaurant.feedbackEnabled = safeRestaurant.feedbackEnabled === true;
  safeRestaurant.feedbackPrompt = String(safeRestaurant.feedbackPrompt || "").trim();
  safeRestaurant.feedbackRewardCustomerId = String(safeRestaurant.feedbackRewardCustomerId || "").trim();
  safeRestaurant.feedbackSurveyQuestions = normalizeSurveyQuestions(safeRestaurant.feedbackSurveyQuestions);
  safeRestaurant.feedbackResultsAccessCode = String(safeRestaurant.feedbackResultsAccessCode || "").trim();
  safeRestaurant.active = safeRestaurant.active !== false;
  safeRestaurant.playable = safeRestaurant.playable !== false;
  safeRestaurant.visibleInList = safeRestaurant.visibleInList ?? safeRestaurant.visible_in_list;
  safeRestaurant.visibleInList = safeRestaurant.visibleInList !== false;
  safeRestaurant.includeAreaQuestions =
    safeRestaurant.includeAreaQuestions ??
    safeRestaurant.include_area_questions ??
    !["americana", "wafflemaster"].includes(safeRestaurant.slug);
  safeRestaurant.includeAreaQuestions = safeRestaurant.includeAreaQuestions !== false;
  safeRestaurant.salesDemoMode = safeRestaurant.salesDemoMode === true || safeRestaurant.sales_demo_mode === true;
  safeRestaurant.questionMix = normalizeQuestionMix(safeRestaurant.questionMix || safeRestaurant.question_mix);
  safeRestaurant.sortOrder = Number(safeRestaurant.sortOrder) || 0;

  return safeRestaurant;
}

export function restaurantFromRecord(record) {
  if (!record) {
    return null;
  }

  const payload = toJsonObject(record.payload_json, {});
  return normalizeRestaurant({
    ...payload,
    id: record.id ?? payload.id,
    active: record.active ?? payload.active,
    playable: record.playable ?? payload.playable,
    visibleInList: record.visible_in_list ?? payload.visibleInList,
    sortOrder: record.sort_order ?? payload.sortOrder,
    slug: record.slug ?? payload.slug,
    name: record.name ?? payload.name,
    publicGameName: record.public_game_name ?? payload.publicGameName,
    location: record.location ?? payload.location,
    areaSlug: record.area_slug ?? payload.areaSlug,
    description: record.description ?? payload.description,
    heroImage: record.hero_image ?? payload.heroImage,
    logoSquare: record.logo_square ?? payload.logoSquare,
    logoHorizontal: record.logo_horizontal ?? payload.logoHorizontal,
    primaryColor: record.primary_color ?? payload.primaryColor,
    secondaryColor: record.secondary_color ?? payload.secondaryColor,
    accentColor: record.accent_color ?? payload.accentColor,
    openingCopy: record.opening_copy ?? payload.openingCopy,
  });
}

export function restaurantToRecord(restaurant, sortOrder = 0) {
  const normalized = normalizeRestaurant(restaurant);
  const timestamp = new Date().toISOString();

  return {
    id: normalized.id || normalized.slug,
    active: normalized.active,
    playable: normalized.playable,
    visible_in_list: normalized.visibleInList,
    sort_order: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : normalized.sortOrder || 0,
    slug: normalized.slug,
    name: normalized.name,
    public_game_name: normalized.publicGameName,
    location: normalized.location,
    area_slug: normalized.areaSlug,
    description: normalized.description,
    hero_image: normalized.heroImage,
    logo_square: normalized.logoSquare,
    logo_horizontal: normalized.logoHorizontal,
    primary_color: normalized.primaryColor,
    secondary_color: normalized.secondaryColor,
    accent_color: normalized.accentColor,
    opening_copy: normalized.openingCopy,
    created_at: normalized.createdAt || timestamp,
    updated_at: timestamp,
    payload_json: normalized,
  };
}

export async function fetchRestaurantsFromSupabase({ includeHidden = false } = {}) {
  const filters = includeHidden ? "" : "&active=eq.true&playable=eq.true";
  const rows = await supabaseRequest(
    `restaurants?select=id,active,playable,visible_in_list,sort_order,slug,name,public_game_name,location,area_slug,description,hero_image,logo_square,logo_horizontal,primary_color,secondary_color,accent_color,opening_copy,created_at,updated_at,payload_json${filters}&order=sort_order.asc,updated_at.asc`
  );
  return Array.isArray(rows) ? rows.map(restaurantFromRecord).filter(Boolean) : [];
}

export async function fetchRestaurantBySlugFromSupabase(slug, { includeHidden = false } = {}) {
  const normalizedSlug = slugifyRestaurant(slug);
  if (!normalizedSlug) {
    return null;
  }

  const filters = includeHidden ? "" : "&active=eq.true&playable=eq.true";
  const rows = await supabaseRequest(
    `restaurants?select=id,active,playable,visible_in_list,sort_order,slug,name,public_game_name,location,area_slug,description,hero_image,logo_square,logo_horizontal,primary_color,secondary_color,accent_color,opening_copy,created_at,updated_at,payload_json&slug=eq.${encodeURIComponent(normalizedSlug)}${filters}&limit=1`
  );
  return Array.isArray(rows) && rows.length ? restaurantFromRecord(rows[0]) : null;
}

export async function fetchAdminRestaurantsFromSupabase() {
  const rows = await supabaseRequest(
    "restaurants?select=id,active,playable,visible_in_list,sort_order,slug,name,public_game_name,location,area_slug,description,hero_image,logo_square,logo_horizontal,primary_color,secondary_color,accent_color,opening_copy,created_at,updated_at,payload_json&order=sort_order.asc,updated_at.asc"
  );
  return Array.isArray(rows) ? rows.map(restaurantFromRecord).filter(Boolean) : [];
}

export async function saveRestaurant(restaurant) {
  const rows = await supabaseRequest("restaurants?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([restaurantToRecord(restaurant, restaurant.sortOrder)]),
  });

  return Array.isArray(rows) && rows.length ? restaurantFromRecord(rows[0]) : normalizeRestaurant(restaurant);
}

export async function deleteRestaurant(id) {
  await supabaseRequest(`restaurants?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

export function validateRestaurant(restaurant) {
  const normalized = normalizeRestaurant(restaurant);
  const errors = [];

  if (!normalized.name) {
    errors.push("Restaurant name is required.");
  }

  if (!normalized.slug) {
    errors.push("Page link name is required.");
  }

  if (!normalized.areaSlug) {
    errors.push("Area tag is required.");
  }

  return { restaurant: normalized, errors };
}

export function filterAdminRestaurants(restaurants, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const status = String(searchParams.get("status") || "all").trim();
  const areaSlug = String(searchParams.get("areaSlug") || "").trim().toLowerCase();

  return (Array.isArray(restaurants) ? restaurants : []).filter((restaurant) => {
    const searchable = [
      restaurant.id,
      restaurant.slug,
      restaurant.name,
      restaurant.publicGameName,
      restaurant.location,
      restaurant.areaSlug,
      ...(Array.isArray(restaurant.themeTags) ? restaurant.themeTags : []),
      restaurant.description,
    ]
      .join(" ")
      .toLowerCase();
    const isAvailable = restaurant.active && restaurant.playable;
    const isPublic = isAvailable && restaurant.visibleInList;
    const isPrivateLink = isAvailable && !restaurant.visibleInList;

    return (
      (!query || searchable.includes(query)) &&
      (status === "all" ||
        (status === "public" && isPublic) ||
        (status === "private" && isPrivateLink) ||
        (status === "paused" && !isAvailable)) &&
      (!areaSlug || String(restaurant.areaSlug || "").toLowerCase() === areaSlug)
    );
  });
}
