import { readFile } from "node:fs/promises";
import {
  questionFromRecord,
} from "../_lib/restaurant-data.mjs";
import { questionRecord } from "../_lib/question-admin.mjs";
import { hasSupabaseConfig, jsonResponse, supabaseRequest } from "../_lib/supabase.mjs";

const QUESTION_BANK_URL = new URL("../../shared/restaurant-question-bank.json", import.meta.url);
const QUESTION_BATCH_SIZE = 50;

async function readSeedQuestions() {
  const raw = await readFile(QUESTION_BANK_URL, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function fetchQuestionsFromSupabase() {
  const rows = await supabaseRequest(
    "questions?select=id,active,scope,restaurant_slug,area_slug,difficulty,tags,customer_ids,sort_order,updated_at,payload_json&active=eq.true&order=sort_order.asc,updated_at.asc"
  );
  return Array.isArray(rows) ? rows.map(questionFromRecord).filter(Boolean) : [];
}

async function seedQuestionsToSupabase(seedQuestions) {
  const seed = Array.isArray(seedQuestions) ? seedQuestions : [];
  for (let index = 0; index < seed.length; index += QUESTION_BATCH_SIZE) {
    const batch = seed.slice(index, index + QUESTION_BATCH_SIZE).map((question, offset) =>
      questionRecord({ ...question, sortOrder: index + offset })
    );

    if (!batch.length) {
      continue;
    }

    await supabaseRequest("questions?on_conflict=id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(batch),
    });
  }
}

export async function GET() {
  try {
    const seedQuestions = await readSeedQuestions();

    if (!hasSupabaseConfig()) {
      return jsonResponse(seedQuestions);
    }

    const questions = await fetchQuestionsFromSupabase();
    if (questions.length) {
      return jsonResponse(questions);
    }

    await seedQuestionsToSupabase(seedQuestions);
    return jsonResponse(seedQuestions);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
