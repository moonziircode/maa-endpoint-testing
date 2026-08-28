import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { District } from "./types";

const DEFAULT_SUPABASE_URL = "https://wqpomgyktrndktsmojqg.supabase.co";

function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  );
}

function getSupabaseKey(): string | null {
  // Least privilege: Prioritize public anon key for reading public districts
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!key || key.trim() === "") {
    return null;
  }
  return key.trim();
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!key) {
    // Return null safely during build / unconfigured CI environment
    return null;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error("[Supabase initialization error]:", err);
    return null;
  }
}

export async function searchDistricts(keyword: string, limit: number = 10): Promise<District[]> {
  try {
    const trimmed = keyword.trim();
    if (!trimmed) return [];

    const client = getSupabaseClient();
    if (!client) {
      console.warn("[Supabase searchDistricts]: Client unconfigured. Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return [];
    }

    const { data, error } = await client
      .from("districts")
      .select("id, dist_code, dist_name, city_code, city_name, province_code, province_name, postal_code, dist_all")
      .or(`dist_name.ilike.%${trimmed}%,city_name.ilike.%${trimmed}%,postal_code.ilike.%${trimmed}%,dist_all.ilike.%${trimmed}%`)
      .limit(limit);

    if (error) {
      console.error("[Supabase searchDistricts error]:", error.message);
      return [];
    }
    return (data as District[]) || [];
  } catch (err: any) {
    console.error("[Supabase searchDistricts exception]:", err?.message || err);
    return [];
  }
}

export async function getDistrictByCode(code: string): Promise<District | null> {
  try {
    const trimmed = code.trim();
    if (!trimmed) return null;

    const client = getSupabaseClient();
    if (!client) {
      console.warn("[Supabase getDistrictByCode]: Client unconfigured. Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return null;
    }

    const { data, error } = await client
      .from("districts")
      .select("*")
      .eq("dist_code", trimmed)
      .single();

    if (error) return null;
    return (data as District) || null;
  } catch (err) {
    return null;
  }
}
