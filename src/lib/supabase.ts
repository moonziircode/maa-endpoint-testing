import { createClient } from "@supabase/supabase-js";
import { District } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wqpomgyktrndktsmojqg.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function searchDistricts(keyword: string, limit: number = 10): Promise<District[]> {
  try {
    const trimmed = keyword.trim();
    if (!trimmed) return [];
    
    const { data, error } = await supabase
      .from("districts")
      .select("id, dist_code, dist_name, city_code, city_name, province_code, province_name, postal_code, dist_all")
      .or(`dist_name.ilike.%${trimmed}%,city_name.ilike.%${trimmed}%,postal_code.ilike.%${trimmed}%,dist_all.ilike.%${trimmed}%`)
      .limit(limit);

    if (error) {
      console.error("[Supabase searchDistricts error]:", error);
      return [];
    }
    return (data as District[]) || [];
  } catch (err) {
    console.error("[Supabase searchDistricts exception]:", err);
    return [];
  }
}

export async function getDistrictByCode(code: string): Promise<District | null> {
  try {
    const { data, error } = await supabase
      .from("districts")
      .select("*")
      .eq("dist_code", code)
      .single();

    if (error) return null;
    return (data as District) || null;
  } catch (err) {
    return null;
  }
}
