import { randomUUID } from "node:crypto";
import { requireQuestionsAdmin } from "../../_lib/admin-auth.mjs";
import {
  fetchAdminCustomersFromSupabase,
  filterAdminCustomers,
  saveCustomer,
  normalizeCustomer,
} from "../../_lib/customer-admin.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../../_lib/supabase.mjs";

function createCustomerId(name) {
  const slug = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || "customer"}-${randomUUID().slice(0, 8)}`;
}

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
    const customers = filterAdminCustomers(await fetchAdminCustomersFromSupabase(), url.searchParams);
    return jsonResponse({ ok: true, customers, count: customers.length });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function POST(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const customer = normalizeCustomer({
      ...(body && typeof body === "object" ? body : {}),
      id: String(body?.id || "").trim() || createCustomerId(body?.name),
    });

    if (!customer.name) {
      return jsonResponse({ ok: false, error: "Customer name is required." }, 400);
    }

    return jsonResponse({ ok: true, customer: await saveCustomer(customer) }, 201);
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
