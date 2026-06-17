import { jsonResponse, readJsonBody } from "./_lib/supabase.mjs";

const CONTACT_TO_EMAIL = "communityversegames@gmail.com";

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, 2000);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function getResendConfig() {
  return {
    apiKey: String(process.env.RESEND_API_KEY || "").trim(),
    fromEmail: String(process.env.RESEND_FROM_EMAIL || "CommunityVerse Games <onboarding@resend.dev>").trim(),
    toEmail: String(process.env.CONTACT_TO_EMAIL || CONTACT_TO_EMAIL).trim(),
  };
}

function textEmail({ name, email, message, page }) {
  return [
    "New CommunityVerse Games contact message",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    page ? `Page: ${page}` : "",
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request) {
  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Please fill out the contact form." }, 400);
  }

  if (String(body.company || "").trim()) {
    return jsonResponse({ ok: true });
  }

  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 120).toLowerCase();
  const message = cleanMessage(body.message);
  const page = cleanText(body.page, 300);

  if (!name) {
    return jsonResponse({ ok: false, error: "Please enter your name." }, 400);
  }
  if (!isValidEmail(email)) {
    return jsonResponse({ ok: false, error: "Please enter a valid email address." }, 400);
  }
  if (message.length < 10) {
    return jsonResponse({ ok: false, error: "Please enter a longer message." }, 400);
  }

  const { apiKey, fromEmail, toEmail } = getResendConfig();
  if (!apiKey) {
    return jsonResponse({ ok: false, error: "Contact email is not configured yet." }, 500);
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `CommunityVerse contact from ${name}`,
      text: textEmail({ name, email, message, page }),
    }),
  });

  const resultText = await response.text();
  let result = null;
  try {
    result = resultText ? JSON.parse(resultText) : null;
  } catch {
    result = resultText;
  }

  if (!response.ok) {
    const errorMessage =
      result && typeof result === "object"
        ? result.message || result.error || "The message could not be sent."
        : "The message could not be sent.";
    return jsonResponse({ ok: false, error: errorMessage }, 502);
  }

  return jsonResponse({ ok: true });
}
