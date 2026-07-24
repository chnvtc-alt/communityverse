import { supabaseRequest } from "./supabase.mjs";

const RESTAURANT_SLUG_ALIASES = {
  cinematavern: "cinema-tavern",
  "cinema-tavern": "cinema-tavern",
  "cinema tavern": "cinema-tavern",
};

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

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) {
      return text;
    }
  }
  return "";
}

function normalizeRestaurant(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw || raw === "shared") {
    return "shared";
  }

  if (RESTAURANT_SLUG_ALIASES[raw]) {
    return RESTAURANT_SLUG_ALIASES[raw];
  }

  if (raw === "americana" || raw === "americana-diner" || raw === "americana diner") {
    return "americana";
  }

  if (["communityverse", "historical", "storybook", "cryptid", "exclusive"].includes(raw)) {
    return "shared";
  }

  const slug = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "shared";
  return RESTAURANT_SLUG_ALIASES[slug] || slug;
}

function slugText(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeCharacterType(value) {
  return slugText(value);
}

function normalizeAreaSlugs(value) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || "").split(",");
  return uniqueStrings(
    rawValues.map((slug) =>
      String(slug || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
  );
}

function normalizeTags(value) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || "").split(",");
  return uniqueStrings(rawValues.map(slugText).filter(Boolean));
}

function labelFromRestaurantSlug(slug) {
  const labels = {
    americana: "Americana Diner",
    "cinema-tavern": "Cinema Tavern",
    fabianos: "Fabiano's",
    gabes: "Gabe's Downtown",
    hudsons: "Hudson's Hickory House",
    marcossp: "Marco's Pizza - South Paulding",
    nkscafe: "N.K.'s Cafe",
    rustybike: "The Rusty Bike Cafe",
    "sam-and-roscos": "Sam & Rosco's",
    wafflemaster: "Waffle Master",
  };
  return labels[String(slug || "").trim()] || "";
}

export function inferCustomerContextLabel(customer) {
  const safeCustomer = typeof customer === "object" && customer ? customer : {};
  const nameKey = String(safeCustomer.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const bio = String(safeCustomer.bio || "").trim().toLowerCase();
  const restaurant = normalizeRestaurant(safeCustomer.restaurant || safeCustomer.focusTag || safeCustomer.focus_tag || "");
  const restaurantName = labelFromRestaurantSlug(restaurant);
  const explicitLabels = {
    "1905 douglasville baseball team": "Local History",
    "bill arp": "Writer / Local History",
    "captain nemo": "Twenty Thousand Leagues Under the Sea",
    "dylan collins": "Trivia Host / Game Creator",
    "jules verne": "Author",
    "long john silver": "Treasure Island",
    "mark twain": "Author",
  };

  if (explicitLabels[nameKey]) return explicitLabels[nameKey];
  if (bio.includes("kitchen manager")) return restaurantName ? `${restaurantName} Kitchen Manager` : "Kitchen Manager";
  if (bio.includes("bartender")) return restaurantName ? `${restaurantName} Bartender` : "Bartender";
  if (bio.includes("server") || bio.includes("staff")) return restaurantName ? `${restaurantName} Staff` : "Restaurant Staff";
  if (bio.includes("owner") || /\bown\b|\bowns\b/.test(bio)) {
    return restaurantName ? `${restaurantName} Owner` : "Restaurant Owner";
  }
  if (/\bauthor\b|\bnovelist\b/.test(bio)) return "Author";
  if (/\bwriter\b/.test(bio)) return "Writer";
  if (bio.includes("treasure island")) return "Treasure Island";
  if (bio.includes("twenty thousand leagues")) return "Twenty Thousand Leagues Under the Sea";
  if (restaurantName) return `${restaurantName} Character`;

  const group = normalizeCharacterType(safeCustomer.characterType || safeCustomer.group || safeCustomer.groupName || "");
  const groupLabels = {
    communityverse: "Community Character",
    cryptid: "Cryptid",
    exclusive: "Restaurant Character",
    historical: "Historical Figure",
    storybook: "Storybook Character",
  };
  return groupLabels[group] || "Community Character";
}

export function normalizeCustomer(customer) {
  const safeCustomer = typeof customer === "object" && customer ? structuredClone(customer) : {};
  safeCustomer.id = String(safeCustomer.id || "").trim();
  safeCustomer.name = String(safeCustomer.name || "").trim();
  safeCustomer.characterType = normalizeCharacterType(
    safeCustomer.characterType || safeCustomer.group || safeCustomer.groupName || ""
  );
  safeCustomer.group = safeCustomer.characterType;
  safeCustomer.groupName = safeCustomer.characterType;
  safeCustomer.rarity = String(safeCustomer.rarity || "").trim();
  safeCustomer.regularValue = Number(safeCustomer.regularValue) || 0;
  safeCustomer.occasionalValue = Number(safeCustomer.occasionalValue) || 0;
  safeCustomer.restaurant = normalizeRestaurant(
    safeCustomer.restaurant || safeCustomer.focusTag || safeCustomer.focus_tag || ""
  );
  safeCustomer.focusTag = safeCustomer.restaurant;
  safeCustomer.image = String(safeCustomer.image || "").trim();
  safeCustomer.bio = String(safeCustomer.bio || "").trim();
  safeCustomer.contextLabel = String(
    safeCustomer.contextLabel || safeCustomer.context_label || ""
  ).trim();
  safeCustomer.areaSlugs = normalizeAreaSlugs(safeCustomer.areaSlugs || safeCustomer.area_slugs || "");
  safeCustomer.tags = normalizeTags(safeCustomer.tags || safeCustomer.theme_tags || "");
  safeCustomer.questionPlace = String(safeCustomer.questionPlace || "").trim();
  safeCustomer.questionFact = String(safeCustomer.questionFact || "").trim();
  safeCustomer.active = safeCustomer.active !== false;
  safeCustomer.feedbackRewardOnly = safeCustomer.feedbackRewardOnly === true;
  safeCustomer.sortOrder = Number(safeCustomer.sortOrder) || 0;
  safeCustomer.createdAt = String(safeCustomer.createdAt || safeCustomer.created_at || "").trim();
  safeCustomer.updatedAt = String(safeCustomer.updatedAt || safeCustomer.updated_at || "").trim();
  if (!safeCustomer.contextLabel) {
    safeCustomer.contextLabel = inferCustomerContextLabel(safeCustomer);
  }
  safeCustomer.customQuestions = Array.isArray(safeCustomer.customQuestions)
    ? safeCustomer.customQuestions.map((question) => ({
        id: String(question?.id || "").trim(),
        prompt: String(question?.prompt || "").trim(),
        correctAnswer: String(question?.correctAnswer || "").trim(),
        wrongAnswers: Array.isArray(question?.wrongAnswers)
          ? question.wrongAnswers.map((answer) => String(answer || "").trim()).filter(Boolean)
          : [],
        difficulty: String(question?.difficulty || "medium").trim() || "medium",
      })).filter((question) => question.id || question.prompt)
    : [];
  return safeCustomer;
}

export function customerFromRecord(record) {
  if (!record) {
    return null;
  }

  const payload = toJsonObject(record.payload_json, {});
  return normalizeCustomer({
    ...payload,
    id: record.id ?? payload.id,
    active: record.active ?? payload.active,
    sortOrder: record.sort_order ?? payload.sortOrder,
    name: record.name ?? payload.name,
    characterType: record.group_name ?? payload.characterType ?? payload.group ?? payload.groupName,
    rarity: record.rarity ?? payload.rarity,
    regularValue: record.regular_value ?? payload.regularValue,
    occasionalValue: record.occasional_value ?? payload.occasionalValue,
    restaurant: record.focus_tag ?? payload.restaurant ?? payload.focusTag,
    image: record.image ?? payload.image,
    bio: firstNonEmpty(record.bio, payload.bio),
    contextLabel: payload.contextLabel ?? payload.context_label,
    questionPlace: record.question_place ?? payload.questionPlace,
    questionFact: record.question_fact ?? payload.questionFact,
    createdAt: record.created_at ?? payload.createdAt,
    updatedAt: record.updated_at ?? payload.updatedAt,
  });
}

export function customerToRecord(customer, sortOrder = 0) {
  const normalized = normalizeCustomer(customer);
  const timestamp = new Date().toISOString();

  return {
    id: normalized.id,
    active: normalized.active,
    sort_order: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : normalized.sortOrder || 0,
    name: normalized.name,
    group_name: normalized.characterType || normalized.group || normalized.groupName || "",
    rarity: normalized.rarity || "",
    regular_value: normalized.regularValue || 0,
    occasional_value: normalized.occasionalValue || 0,
    focus_tag: normalized.restaurant || normalized.focusTag || "",
    image: normalized.image || "",
    bio: normalized.bio || "",
    question_place: normalized.questionPlace || "",
    question_fact: normalized.questionFact || "",
    created_at: normalized.createdAt || timestamp,
    updated_at: timestamp,
    payload_json: normalized,
  };
}

export async function fetchCustomersFromSupabase() {
  const rows = await supabaseRequest(
    "customers?select=id,active,sort_order,name,group_name,rarity,regular_value,occasional_value,focus_tag,image,bio,question_place,question_fact,created_at,updated_at,payload_json&active=eq.true&order=sort_order.asc,updated_at.asc"
  );
  return Array.isArray(rows) ? rows.map(customerFromRecord).filter(Boolean) : [];
}

export async function fetchAdminCustomersFromSupabase() {
  const rows = await supabaseRequest(
    "customers?select=id,active,sort_order,name,group_name,rarity,regular_value,occasional_value,focus_tag,image,bio,question_place,question_fact,created_at,updated_at,payload_json&order=sort_order.asc,updated_at.asc"
  );
  return Array.isArray(rows) ? rows.map(customerFromRecord).filter(Boolean) : [];
}

export async function saveCustomer(customer) {
  const rows = await supabaseRequest("customers?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([customerToRecord(customer, customer.sortOrder)]),
  });

  return Array.isArray(rows) && rows.length ? customerFromRecord(rows[0]) : normalizeCustomer(customer);
}

export async function deleteCustomer(id) {
  await supabaseRequest(`customers?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

export async function seedCustomersToSupabase(seedCustomers) {
  const seed = Array.isArray(seedCustomers) ? seedCustomers : [];
  for (let index = 0; index < seed.length; index += 50) {
    const batch = seed.slice(index, index + 50).map((customer, offset) => customerToRecord(customer, index + offset));
    if (!batch.length) continue;
    await supabaseRequest("customers?on_conflict=id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(batch),
    });
  }
}

export function filterAdminCustomers(customers, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const status = String(searchParams.get("status") || "all").trim();
  const characterType = String(searchParams.get("characterType") || searchParams.get("group") || "")
    .trim()
    .toLowerCase();
  const restaurant = String(searchParams.get("restaurant") || searchParams.get("focusTag") || "")
    .trim()
    .toLowerCase();
  const areaSlug = slugText(searchParams.get("areaSlug") || searchParams.get("area") || "");
  const rarity = String(searchParams.get("rarity") || "").trim().toLowerCase();

  return (Array.isArray(customers) ? customers : []).filter((customer) => {
    const searchable = [
      customer.id,
      customer.name,
      customer.group,
      customer.characterType,
      customer.rarity,
      customer.restaurant,
      customer.focusTag,
      ...(Array.isArray(customer.areaSlugs) ? customer.areaSlugs : []),
      ...(Array.isArray(customer.tags) ? customer.tags : []),
      customer.bio,
      customer.questionPlace,
      customer.questionFact,
      ...(customer.customQuestions || []).flatMap((question) => [
        question.prompt,
        question.correctAnswer,
        ...(question.wrongAnswers || []),
      ]),
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (status === "all" || (status === "active" ? customer.active : !customer.active)) &&
      (!characterType || String(customer.characterType || customer.group || "").toLowerCase() === characterType) &&
      (!restaurant || String(customer.restaurant || customer.focusTag || "").toLowerCase() === restaurant) &&
      (!areaSlug ||
        (Array.isArray(customer.areaSlugs) &&
          customer.areaSlugs
            .map(slugText)
            .some((slug) => slug === areaSlug || slug.includes(areaSlug) || areaSlug.includes(slug)))) &&
      (!rarity || String(customer.rarity || "").toLowerCase() === rarity)
    );
  });
}
