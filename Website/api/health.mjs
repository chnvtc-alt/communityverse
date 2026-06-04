import { hasSupabaseConfig, jsonResponse } from "./_lib/supabase.mjs";

export async function GET() {
  return jsonResponse({
    ok: true,
    mode: hasSupabaseConfig() ? "supabase" : "missing-env",
  });
}
