import {
  normalizeQuestion,
  questionFromRecord,
  questionToRecord,
} from "./restaurant-data.mjs";
import { supabaseRequest, supabaseRequestAll } from "./supabase.mjs";

const VALID_SCOPES = new Set(["restaurant", "area", "global", "customer"]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

export function validateQuestion(input, forcedId = "") {
  const question = normalizeQuestion({
    ...(input && typeof input === "object" ? input : {}),
    id: forcedId || input?.id,
  });

  question.scope = question.scope || "global";
  question.difficulty = question.difficulty || "medium";
  question.tags = uniqueStrings(question.tags);
  question.customerIds = uniqueStrings(question.customerIds);

  const errors = [];
  if (!question.id) errors.push("Question id is required.");
  if (!VALID_SCOPES.has(question.scope)) errors.push("Scope must be restaurant, area, global, or customer.");
  if (!question.prompt) errors.push("Question prompt is required.");
  if (!question.correctAnswer) errors.push("Correct answer is required.");
  if (question.wrongAnswers.length < 3) errors.push("Add at least three wrong answers.");
  if (!VALID_DIFFICULTIES.has(question.difficulty)) errors.push("Difficulty must be easy, medium, or hard.");
  if (question.scope === "restaurant" && !question.restaurantSlug) {
    errors.push("Restaurant slug is required for restaurant questions.");
  }
  if (question.scope === "area" && !question.areaSlug) {
    errors.push("Area slug is required for area questions.");
  }
  if (question.scope === "customer" && !question.customerIds.length) {
    errors.push("Choose at least one customer for customer questions.");
  }

  return { question, errors };
}

export function questionRecord(question) {
  const normalized = normalizeQuestion(question);
  const record = questionToRecord(normalized, normalized.sortOrder);
  return {
    ...record,
    scope: normalized.scope || "global",
    restaurant_slug: normalized.restaurantSlug || null,
    area_slug: normalized.areaSlug || null,
    difficulty: normalized.difficulty,
    tags: normalized.tags,
    customer_ids: normalized.customerIds,
  };
}

export async function fetchAdminQuestions() {
  const rows = await supabaseRequestAll(
    "questions?select=id,active,scope,restaurant_slug,area_slug,difficulty,tags,customer_ids,sort_order,created_at,updated_at,payload_json&order=updated_at.desc"
  );
  return Array.isArray(rows) ? rows.map(questionFromRecord).filter(Boolean) : [];
}

export async function saveQuestion(question) {
  const rows = await supabaseRequest("questions?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([questionRecord(question)]),
  });

  return Array.isArray(rows) && rows.length ? questionFromRecord(rows[0]) : question;
}

export async function deleteQuestion(id) {
  await supabaseRequest(`questions?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

export function filterAdminQuestions(questions, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const scope = String(searchParams.get("scope") || "").trim();
  const restaurantSlug = String(searchParams.get("restaurantSlug") || "").trim();
  const areaSlug = String(searchParams.get("areaSlug") || "").trim();
  const customerId = String(searchParams.get("customerId") || "").trim();
  const tag = String(searchParams.get("tag") || "").trim();
  const difficulty = String(searchParams.get("difficulty") || "").trim();
  const status = String(searchParams.get("status") || "all").trim();

  return questions.filter((question) => {
    const searchable = [
      question.id,
      question.prompt,
      question.correctAnswer,
      question.restaurantSlug,
      question.areaSlug,
      ...(question.tags || []),
      ...(question.customerIds || []),
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (!scope || question.scope === scope) &&
      (!restaurantSlug || question.restaurantSlug === restaurantSlug) &&
      (!areaSlug || question.areaSlug === areaSlug) &&
      (!customerId || question.customerIds.includes(customerId)) &&
      (!tag || question.tags.includes(tag)) &&
      (!difficulty || question.difficulty === difficulty) &&
      (status === "all" || (status === "active" ? question.active : !question.active))
    );
  });
}
