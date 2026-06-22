import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import { sessionFromRecord } from "../../_lib/restaurant-data.mjs";
import { hasSupabaseConfig, jsonResponse, supabaseRequest } from "../../_lib/supabase.mjs";

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

export async function GET(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const url = new URL(request.url);
    const profileId = String(url.searchParams.get("profileId") || "").trim();
    const query = profileId
      ? `sessions?select=id,profile_id,restaurant_slug,completed_at,payload_json&profile_id=eq.${encodeURIComponent(profileId)}&order=completed_at.desc`
      : "sessions?select=id,profile_id,restaurant_slug,completed_at,payload_json&order=completed_at.desc";
    const rows = await supabaseRequest(query);
    const sessions = Array.isArray(rows) ? rows.map(sessionFromRecord).filter(Boolean) : [];
    return jsonResponse({ ok: true, sessions, count: sessions.length });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
