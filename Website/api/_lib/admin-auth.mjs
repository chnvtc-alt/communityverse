import { timingSafeEqual } from "node:crypto";
import { jsonResponse } from "./supabase.mjs";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function requireQuestionsAdmin(request) {
  const configuredKey = String(process.env.QUESTIONS_ADMIN_KEY || "").trim();
  if (!configuredKey) {
    return jsonResponse(
      { ok: false, error: "QUESTIONS_ADMIN_KEY is not configured." },
      503
    );
  }

  const authorization = String(request.headers.get("authorization") || "");
  const suppliedKey = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!suppliedKey || !safeEqual(suppliedKey, configuredKey)) {
    return jsonResponse({ ok: false, error: "Admin access denied." }, 401);
  }

  return null;
}
