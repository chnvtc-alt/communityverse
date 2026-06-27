import { randomUUID } from "node:crypto";
import { fetchRestaurantBySlugFromSupabase } from "./restaurant-admin.mjs";
import { supabaseRequest } from "./supabase.mjs";

function normalizeAnswer(answer) {
  const safeAnswer = typeof answer === "object" && answer ? answer : {};
  return {
    questionId: String(safeAnswer.questionId || "").trim(),
    questionText: String(safeAnswer.questionText || "").trim().slice(0, 500),
    type: String(safeAnswer.type || "").trim(),
    value: String(safeAnswer.value || "").trim().slice(0, 1000),
  };
}

export function normalizeFeedbackResponse(response) {
  const safeResponse = typeof response === "object" && response ? response : {};
  const submittedAt = String(safeResponse.submittedAt || safeResponse.submitted_at || new Date().toISOString());

  return {
    id: String(safeResponse.id || "").trim() || `feedback-${randomUUID()}`,
    restaurantSlug: String(safeResponse.restaurantSlug || safeResponse.restaurant_slug || "").trim(),
    restaurantName: String(safeResponse.restaurantName || safeResponse.restaurant_name || "").trim(),
    profileId: String(safeResponse.profileId || safeResponse.profile_id || "").trim(),
    rewardCustomerId: String(safeResponse.rewardCustomerId || safeResponse.reward_customer_id || "").trim(),
    rewardCustomerName: String(safeResponse.rewardCustomerName || safeResponse.reward_customer_name || "").trim(),
    rewardAwarded: safeResponse.rewardAwarded === true || safeResponse.reward_awarded === true,
    answers: Array.isArray(safeResponse.answers)
      ? safeResponse.answers.map(normalizeAnswer).filter((answer) => answer.questionId && answer.questionText)
      : [],
    submittedAt,
  };
}

function feedbackResponseFromRecord(record) {
  if (!record) {
    return null;
  }

  const payload = typeof record.payload_json === "object" && record.payload_json
    ? record.payload_json
    : {};

  return normalizeFeedbackResponse({
    ...payload,
    id: record.id ?? payload.id,
    restaurantSlug: record.restaurant_slug ?? payload.restaurantSlug,
    profileId: record.profile_id ?? payload.profileId,
    rewardCustomerId: record.reward_customer_id ?? payload.rewardCustomerId,
    submittedAt: record.submitted_at ?? payload.submittedAt,
  });
}

function feedbackResponseToRecord(response) {
  const normalized = normalizeFeedbackResponse(response);

  return {
    id: normalized.id,
    restaurant_slug: normalized.restaurantSlug,
    profile_id: normalized.profileId || null,
    reward_customer_id: normalized.rewardCustomerId,
    submitted_at: normalized.submittedAt,
    payload_json: normalized,
  };
}

export async function saveFeedbackResponse(response) {
  const normalized = normalizeFeedbackResponse(response);
  const restaurant = await fetchRestaurantBySlugFromSupabase(normalized.restaurantSlug);

  if (!restaurant || !restaurant.feedbackEnabled) {
    throw new Error("This feedback survey is not available right now.");
  }

  if (!restaurant.feedbackRewardCustomerId) {
    throw new Error("This restaurant does not have a feedback reward customer yet.");
  }

  const activeQuestions = (restaurant.feedbackSurveyQuestions || []).filter(
    (question) => question.active !== false
  );
  const activeQuestionIds = new Set(activeQuestions.map((question) => question.id));
  const answers = activeQuestionIds.size
    ? normalized.answers.filter((answer) => activeQuestionIds.has(answer.questionId))
    : normalized.answers;

  if (!answers.length) {
    throw new Error("Please answer the survey before claiming this reward.");
  }

  const requiredQuestions = activeQuestions.filter((question) => question.required !== false);
  const answeredIds = new Set(answers.filter((answer) => answer.value).map((answer) => answer.questionId));
  const missingRequired = requiredQuestions.find((question) => !answeredIds.has(question.id));
  if (missingRequired) {
    throw new Error(`Please answer: ${missingRequired.prompt}`);
  }

  const responseToStore = normalizeFeedbackResponse({
    ...normalized,
    restaurantName: restaurant.name,
    rewardCustomerId: restaurant.feedbackRewardCustomerId,
    answers,
  });

  const rows = await supabaseRequest("feedback_responses?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([feedbackResponseToRecord(responseToStore)]),
  });

  return Array.isArray(rows) && rows.length ? feedbackResponseFromRecord(rows[0]) : responseToStore;
}

export async function fetchFeedbackResponses(searchParams = new URLSearchParams()) {
  const restaurantSlug = String(searchParams.get("restaurantSlug") || "").trim();
  const filters = restaurantSlug ? `&restaurant_slug=eq.${encodeURIComponent(restaurantSlug)}` : "";
  const rows = await supabaseRequest(
    `feedback_responses?select=id,restaurant_slug,profile_id,reward_customer_id,submitted_at,payload_json${filters}&order=submitted_at.desc`
  );

  return Array.isArray(rows) ? rows.map(feedbackResponseFromRecord).filter(Boolean) : [];
}

export async function deleteFeedbackResponse(id) {
  const safeId = String(id || "").trim();
  if (!safeId) {
    throw new Error("Feedback response id is required.");
  }

  await supabaseRequest(`feedback_responses?id=eq.${encodeURIComponent(safeId)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}
