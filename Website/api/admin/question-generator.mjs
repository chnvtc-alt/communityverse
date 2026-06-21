import { requireQuestionsAdmin } from "../_lib/admin-auth.mjs";
import { jsonResponse, readJsonBody } from "../_lib/supabase.mjs";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";

const QUESTION_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          correctAnswer: { type: "string" },
          wrongAnswers: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 3,
          },
          tags: {
            type: "array",
            items: { type: "string" },
            maxItems: 5,
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
        },
        required: ["prompt", "correctAnswer", "wrongAnswers", "tags", "difficulty"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
};

function extractOutputText(response) {
  if (typeof response?.output_text === "string") {
    return response.output_text;
  }

  for (const item of Array.isArray(response?.output) ? response.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

function generatorInput(body) {
  const mode = body?.mode === "wrongAnswers" ? "wrongAnswers" : "questions";
  if (mode === "wrongAnswers") {
    const prompt = String(body?.prompt || "").trim();
    const correctAnswer = String(body?.correctAnswer || "").trim();
    if (!prompt || !correctAnswer) {
      throw new Error("Enter the question and correct answer first.");
    }
    if (prompt.length > 1000 || correctAnswer.length > 500) {
      throw new Error("The question or answer is too long for the helper.");
    }

    return {
      mode,
      count: 1,
      source: JSON.stringify({
        task: "Create exactly three plausible but definitely incorrect multiple-choice answers.",
        question: prompt,
        correctAnswer,
        difficulty: String(body?.difficulty || "medium"),
      }),
    };
  }

  const source = String(body?.source || "").trim();
  if (!source) {
    throw new Error("Enter a topic or some notes first.");
  }
  if (source.length > 12000) {
    throw new Error("Please shorten the topic or notes to 12,000 characters.");
  }

  return {
    mode,
    count: Math.min(5, Math.max(1, Number(body?.count) || 3)),
    source: JSON.stringify({
      task: "Create clear multiple-choice trivia questions from this topic or information.",
      source,
      requestedCount: Math.min(5, Math.max(1, Number(body?.count) || 3)),
      difficulty: String(body?.difficulty || "medium"),
    }),
  };
}

async function generateQuestions(input) {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured in Vercel.");
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: String(process.env.OPENAI_QUESTION_MODEL || DEFAULT_MODEL),
      reasoning: { effort: "low" },
      store: false,
      instructions: [
        "You create family-friendly multiple-choice trivia for CommunityVerse.",
        `Return exactly ${input.count} question object${input.count === 1 ? "" : "s"}.`,
        "Every question must have one unambiguous correct answer and exactly three believable but incorrect answers.",
        "Wrong answers must not be alternate spellings, synonyms, partial versions, or other arguably correct answers.",
        "Write every prompt as a self-contained question. If the topic is Seinfeld, Bob Seger, Jennifer Lopez, a restaurant, or any other named subject, mention that subject in the prompt unless the prompt is already completely clear without it.",
        "Use proper capitalization for names, places, titles, brands, restaurants, songs, movies, shows, and answer choices.",
        "Keep prompts concise. Avoid trick questions, disputed claims, politics, graphic material, and time-sensitive facts.",
        "Use lowercase hyphenated tags. The human editor will review every draft before saving.",
      ].join(" "),
      input: input.source,
      text: {
        format: {
          type: "json_schema",
          name: "communityverse_questions",
          strict: true,
          schema: QUESTION_SCHEMA,
        },
      },
      max_output_tokens: 2200,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `OpenAI request failed (${response.status}).`;
    throw new Error(message);
  }

  const text = extractOutputText(data);
  if (!text) {
    throw new Error("The AI did not return any question drafts. Please try again.");
  }

  const parsed = JSON.parse(text);
  const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
  if (!questions.length) {
    throw new Error("The AI did not return any question drafts. Please try again.");
  }

  return questions;
}

export async function POST(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;

  try {
    const input = generatorInput(await readJsonBody(request));
    return jsonResponse({ ok: true, questions: await generateQuestions(input) });
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      400
    );
  }
}
