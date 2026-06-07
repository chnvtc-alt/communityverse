function getRequiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

function normalizeSupabaseUrl(value) {
  const trimmed = String(value || "").trim().replace(/\/+$/, "");
  return trimmed.replace(/\/rest\/v1$/, "");
}

export function getSupabaseConfig() {
  return {
    url: normalizeSupabaseUrl(getRequiredEnv("SUPABASE_URL")),
    serviceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function hasSupabaseConfig() {
  return Boolean(String(process.env.SUPABASE_URL || "").trim() && String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim());
}

export async function supabaseRequest(path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const headers = new Headers(options.headers || {});
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${url}/rest/v1/${path.replace(/^\/+/, "")}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data && typeof data === "object" ? JSON.stringify(data) : text || response.statusText;
    throw new Error(message);
  }

  return data;
}

export async function supabaseStorageRequest(path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const headers = new Headers(options.headers || {});
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);

  const response = await fetch(`${url}/storage/v1/${path.replace(/^\/+/, "")}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data && typeof data === "object" ? JSON.stringify(data) : text || response.statusText;
    throw new Error(message);
  }

  return data;
}

export function supabasePublicStorageUrl(path) {
  const { url } = getSupabaseConfig();
  return `${url}/storage/v1/object/public/${String(path || "").replace(/^\/+/, "")}`;
}

export function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function readJsonBody(request) {
  const text = await request.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}
