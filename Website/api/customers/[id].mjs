import { customerFromRecord, customerToRecord } from "../_lib/customer-admin.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody, supabaseRequest } from "../_lib/supabase.mjs";

function getCustomerIdFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "").trim();
}

async function fetchCustomer(id) {
  const rows = await supabaseRequest(
    `customers?select=id,active,sort_order,name,group_name,rarity,regular_value,occasional_value,focus_tag,image,bio,question_place,question_fact,created_at,updated_at,payload_json&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  return Array.isArray(rows) && rows.length ? customerFromRecord(rows[0]) : null;
}

async function upsertCustomer(id, body) {
  const normalized = customerFromRecord({
    id,
    active: body?.active,
    sort_order: body?.sortOrder,
    name: body?.name,
    group_name: body?.group || body?.groupName,
    rarity: body?.rarity,
    regular_value: body?.regularValue,
    occasional_value: body?.occasionalValue,
    focus_tag: body?.focusTag,
    image: body?.image,
    bio: body?.bio,
    question_place: body?.questionPlace,
    question_fact: body?.questionFact,
    payload_json: body,
  });

  const payload = customerToRecord(normalized, normalized.sortOrder);
  payload.id = normalized.id;

  await supabaseRequest("customers?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([payload]),
  });

  return normalized;
}

export async function GET(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  try {
    const id = getCustomerIdFromRequest(request);
    if (!id) {
      return jsonResponse({ ok: false, error: "Customer id is required." }, 400);
    }

    const customer = await fetchCustomer(id);
    if (!customer) {
      return jsonResponse({ ok: false, error: "Customer not found." }, 404);
    }

    return jsonResponse(customer);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}

export async function PUT(request) {
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase environment variables are not configured." }, 500);
  }

  const id = getCustomerIdFromRequest(request);
  if (!id) {
    return jsonResponse({ ok: false, error: "Customer id is required." }, 400);
  }

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Expected a JSON customer object." }, 400);
  }

  try {
    return jsonResponse(await upsertCustomer(id, body));
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
