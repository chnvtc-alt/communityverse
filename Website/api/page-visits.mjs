import { recordPageVisit } from "./_lib/page-visits.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "./_lib/supabase.mjs";

export async function POST(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: true, recorded: false });
  }

  try {
    const body = await readJsonBody(request);
    return jsonResponse({ ok: true, ...(await recordPageVisit(body)) });
  } catch {
    return jsonResponse({ ok: true, recorded: false });
  }
}
