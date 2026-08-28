import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { District } from "./types";

const DEFAULT_SUPABASE_URL = "https://wqpomgyktrndktsmojqg.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcG9tZ3lrdHJuZGt0c21vanFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4ODM4NDUsImV4cCI6MjEwMzQ1OTg0NX0.fcL8R8Jkw-XRaXFVD0Is3EexG-jBaGYK0pbfB2gQQdE";

function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  );
}

function getSupabaseKey(): string {
  // Least privilege: Prioritize public anon key for reading public districts
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  return key.trim();
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedClient;
}

export async function searchDistricts(keyword: string, limit: number = 8): Promise<District[]> {
  try {
    const trimmed = keyword.trim();
    if (!trimmed || trimmed.length < 2) return [];

    const client = getSupabaseClient();
    const safeLimit = Math.min(Math.max(1, limit), 50);

    const { data, error } = await client
      .from("districts")
      .select("id, dist_code, dist_name, city_code, city_name, province_code, province_name, postal_code, dist_all")
      .or(`dist_name.ilike.%${trimmed}%,city_name.ilike.%${trimmed}%,postal_code.ilike.%${trimmed}%,dist_all.ilike.%${trimmed}%`)
      .limit(safeLimit);

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
