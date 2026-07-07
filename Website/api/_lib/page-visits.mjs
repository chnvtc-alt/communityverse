import { randomUUID } from "node:crypto";
import { supabaseRequest } from "./supabase.mjs";

const PAGE_PATH_PATTERN = /^\/[a-z0-9/_-]*$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function safeString(value) {
  return String(value || "").trim();
}

function safePagePath(value) {
  const path = safeString(value).replace(/\/+$/, "") || "/";
  return PAGE_PATH_PATTERN.test(path) ? path : "";
}

function safeDate(value) {
  const date = safeString(value);
  return DATE_PATTERN.test(date) ? date : new Date().toISOString().slice(0, 10);
}

function safeVisitorKey(value) {
  return safeString(value).slice(0, 120);
}

function easternDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function daysAgo(days = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return easternDate(date);
}

function emptyStats() {
  return {
    today: 0,
    sevenDays: 0,
    thirtyDays: 0,
    total: 0,
  };
}

export async function recordPageVisit(input = {}) {
  const pagePath = safePagePath(input.pagePath);
  const visitorKey = safeVisitorKey(input.visitorKey);
  if (!pagePath || !visitorKey) {
    return { recorded: false };
  }

  const record = {
    id: randomUUID(),
    page_path: pagePath,
    visitor_key: visitorKey,
    visit_date: safeDate(input.visitDate),
  };

  await supabaseRequest("page_visits?on_conflict=page_path,visitor_key,visit_date", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify([record]),
  });

  return { recorded: true };
}

export async function fetchPageVisitStats(pagePath = "/restaurant") {
  const safePath = safePagePath(pagePath);
  if (!safePath) {
    return emptyStats();
  }

  const rows = await supabaseRequest(
    `page_visits?select=visit_date&page_path=eq.${encodeURIComponent(safePath)}`
  );
  const dates = (Array.isArray(rows) ? rows : [])
    .map((row) => safeDate(row.visit_date))
    .filter(Boolean);
  const today = daysAgo(0);
  const sevenDaysStart = daysAgo(6);
  const thirtyDaysStart = daysAgo(29);

  return {
    today: dates.filter((date) => date === today).length,
    sevenDays: dates.filter((date) => date >= sevenDaysStart).length,
    thirtyDays: dates.filter((date) => date >= thirtyDaysStart).length,
    total: dates.length,
  };
}
