import { NextRequest, NextResponse } from "next/server";
import { searchDistricts, getDistrictByCode } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const code = searchParams.get("code");
  const limit = parseInt(searchParams.get("limit") || "10", 10);

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
