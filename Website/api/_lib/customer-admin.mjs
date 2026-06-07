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

export function normalizeCustomer(customer) {
  const safeCustomer = typeof customer === "object" && customer ? structuredClone(customer) : {};
  safeCustomer.id = String(safeCustomer.id || "").trim();
  safeCustomer.name = String(safeCustomer.name || "").trim();
  safeCustomer.group = String(safeCustomer.group || safeCustomer.groupName || "").trim();
  safeCustomer.rarity = String(safeCustomer.rarity || "").trim();
  safeCustomer.regularValue = Number(safeCustomer.regularValue) || 0;
  safeCustomer.occasionalValue = Number(safeCustomer.occasionalValue) || 0;
  safeCustomer.focusTag = String(safeCustomer.focusTag || "").trim();
  safeCustomer.image = String(safeCustomer.image || "").trim();
  safeCustomer.bio = String(safeCustomer.bio || "").trim();
  safeCustomer.questionPlace = String(safeCustomer.questionPlace || "").trim();
  safeCustomer.questionFact = String(safeCustomer.questionFact || "").trim();
  safeCustomer.groupName = String(safeCustomer.groupName || safeCustomer.group || "").trim();
  safeCustomer.active = safeCustomer.active !== false;
  safeCustomer.sortOrder = Number(safeCustomer.sortOrder) || 0;
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
    group: record.group_name ?? payload.group ?? payload.groupName,
    rarity: record.rarity ?? payload.rarity,
    regularValue: record.regular_value ?? payload.regularValue,
    occasionalValue: record.occasional_value ?? payload.occasionalValue,
    focusTag: record.focus_tag ?? payload.focusTag,
    image: record.image ?? payload.image,
    bio: record.bio ?? payload.bio,
    questionPlace: record.question_place ?? payload.questionPlace,
    questionFact: record.question_fact ?? payload.questionFact,
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
    group_name: normalized.groupName || normalized.group || "",
    rarity: normalized.rarity || "",
    regular_value: normalized.regularValue || 0,
    occasional_value: normalized.occasionalValue || 0,
    focus_tag: normalized.focusTag || "",
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
  const group = String(searchParams.get("group") || "").trim().toLowerCase();
  const focusTag = String(searchParams.get("focusTag") || "").trim().toLowerCase();
  const rarity = String(searchParams.get("rarity") || "").trim().toLowerCase();

  return (Array.isArray(customers) ? customers : []).filter((customer) => {
    const searchable = [
      customer.id,
      customer.name,
      customer.group,
      customer.rarity,
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
      (!group || String(customer.group || "").toLowerCase() === group) &&
      (!focusTag || String(customer.focusTag || "").toLowerCase() === focusTag) &&
      (!rarity || String(customer.rarity || "").toLowerCase() === rarity)
    );
  });
}
