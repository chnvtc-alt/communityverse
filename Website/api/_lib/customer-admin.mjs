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

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function normalizeRestaurant(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw || raw === "shared") {
    return "shared";
  }

  if (raw === "americana" || raw === "americana-diner" || raw === "americana diner") {
    return "americana";
  }

  if (["communityverse", "historical", "storybook", "cryptid", "exclusive"].includes(raw)) {
    return "shared";
  }

  return raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "shared";
}

function normalizeCharacterType(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
  safeCustomer.areaSlugs = normalizeAreaSlugs(safeCustomer.areaSlugs || safeCustomer.area_slugs || "");
  safeCustomer.questionPlace = String(safeCustomer.questionPlace || "").trim();
  safeCustomer.questionFact = String(safeCustomer.questionFact || "").trim();
  safeCustomer.active = safeCustomer.active !== false;
  safeCustomer.feedbackRewardOnly = safeCustomer.feedbackRewardOnly === true;
  safeCustomer.sortOrder = Number(safeCustomer.sortOrder) || 0;
  safeCustomer.createdAt = String(safeCustomer.createdAt || safeCustomer.created_at || "").trim();
  safeCustomer.updatedAt = String(safeCustomer.updatedAt || safeCustomer.updated_at || "").trim();
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
    bio: record.bio ?? payload.bio,
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
      (!rarity || String(customer.rarity || "").toLowerCase() === rarity)
    );
  });
}
