import { NextRequest, NextResponse } from "next/server";
import { searchDistricts, getDistrictByCode } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const code = searchParams.get("code");
    const rawLimit = searchParams.get("limit");
    const limit = rawLimit ? Math.min(Math.max(1, parseInt(rawLimit, 10) || 8), 50) : 8;

    if (code) {
      const district = await getDistrictByCode(code);
      if (!district) {
        return NextResponse.json({ success: true, district: null, message: "Kecamatan tidak ditemukan" });
      }
      return NextResponse.json({ success: true, district });
    }

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, districts: [] });
    }

    const districts = await searchDistricts(q, limit);
    return NextResponse.json({ success: true, districts });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || "Terjadi kesalahan pada query master kecamatan",
      districts: []
    }, { status: 500 });
  }
}
