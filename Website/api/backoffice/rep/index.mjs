import { requireBackofficeRep } from "../../_lib/admin-auth.mjs";
import {
  fetchDoyceEmailTemplate,
  fetchBackofficeRepData,
  saveBackofficeRepRestaurant,
} from "../../_lib/backoffice-admin.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../../_lib/supabase.mjs";

const REP_NAME = "Doyce";

function preflight(request) {
  const denied = requireBackofficeRep(request, REP_NAME);
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
    return jsonResponse({
      ok: true,
      rep: REP_NAME,
      ...(await fetchBackofficeRepData(REP_NAME)),
      emailTemplate: await fetchDoyceEmailTemplate(),
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function POST(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const action = String(body?.action || "").trim();

    if (action === "saveRestaurant") {
      return jsonResponse({
        ok: true,
        restaurant: await saveBackofficeRepRestaurant(REP_NAME, body.restaurant),
      });
    }

    return jsonResponse({ ok: false, error: "Unknown sales rep action." }, 400);
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
