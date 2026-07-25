import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import { deleteCustomer, normalizeCustomer, saveCustomer } from "../../_lib/customer-admin.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../../_lib/supabase.mjs";

function getCustomerIdFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "").trim();
}

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

export async function PUT(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const id = getCustomerIdFromRequest(request);
    const body = await readJsonBody(request);
    const customer = normalizeCustomer({ ...(body && typeof body === "object" ? body : {}), id });

    if (!customer.name) {
      return jsonResponse({ ok: false, error: "Customer name is required." }, 400);
    }

    if (!customer.characterCategory) {
      return jsonResponse({ ok: false, error: "Collection category is required." }, 400);
    }

    return jsonResponse({ ok: true, customer: await saveCustomer(customer) });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function DELETE(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const id = getCustomerIdFromRequest(request);
    if (!id) return jsonResponse({ ok: false, error: "Customer id is required." }, 400);
    await deleteCustomer(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
