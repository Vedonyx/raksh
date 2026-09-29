import "server-only";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  whatsapp: string | null;
  module: string;
  preferred_date: string | null;
  preferred_time: string | null;
  goal: string | null;
  status: LeadStatus;
  admin_note: string | null;
};

function config() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!rawUrl || !key || !key.startsWith("sb_secret_")) {
    throw new Error("Supabase server configuration is missing");
  }
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) {
    throw new Error("Invalid Supabase project URL");
  }
  return { url: url.origin, key };
}

export async function supabaseRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("Supabase REST request failed", response.status);
    throw new Error("Database request failed");
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as T;
  return response.json() as Promise<T>;
}
