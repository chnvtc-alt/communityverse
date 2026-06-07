import { readFile } from "node:fs/promises";
import { customerFromRecord } from "../_lib/customer-admin.mjs";
import { hasSupabaseConfig, jsonResponse, supabaseRequest } from "../_lib/supabase.mjs";
import { seedCustomersToSupabase } from "../_lib/customer-admin.mjs";

const CUSTOMER_BANK_URL = new URL("../../shared/customer-bank.json", import.meta.url);
const CUSTOMER_BATCH_SIZE = 50;

async function readSeedCustomers() {
  const raw = await readFile(CUSTOMER_BANK_URL, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function fetchCustomersFromSupabase() {
  const rows = await supabaseRequest(
    "customers?select=id,active,sort_order,name,group_name,rarity,regular_value,occasional_value,focus_tag,image,bio,question_place,question_fact,created_at,updated_at,payload_json&active=eq.true&order=sort_order.asc,updated_at.asc"
  );
  return Array.isArray(rows) ? rows.map(customerFromRecord).filter(Boolean) : [];
}

export async function GET() {
  try {
    const seedCustomers = await readSeedCustomers();

    if (!hasSupabaseConfig()) {
      return jsonResponse(seedCustomers);
    }

    const customers = await fetchCustomersFromSupabase();
    if (customers.length) {
      return jsonResponse(customers);
    }

    for (let index = 0; index < seedCustomers.length; index += CUSTOMER_BATCH_SIZE) {
      const batch = seedCustomers.slice(index, index + CUSTOMER_BATCH_SIZE);
      if (!batch.length) continue;
      await seedCustomersToSupabase(batch);
    }

    return jsonResponse(seedCustomers);
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
