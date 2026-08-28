import { NextRequest, NextResponse } from "next/server";
import { searchDistricts, getDistrictByCode, getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const code = searchParams.get("code");
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  // Check if client is configured
  const client = getSupabaseClient();
  if (!client) {
    return NextResponse.json({
      success: false,
      error: "Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.",
      districts: []
    }, { status: 503 });
  }

  if (code) {
    const district = await getDistrictByCode(code);
    return NextResponse.json({ success: true, district });
  }

  if (!q) {
    return NextResponse.json({ success: true, districts: [] });
  }

  const districts = await searchDistricts(q, limit);
  return NextResponse.json({ success: true, districts });
}
