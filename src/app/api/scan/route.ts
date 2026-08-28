import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { scanAndValidateAWB } from "@/lib/anteraja-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized / Sesi telah berakhir" }, { status: 401 });
  }

  const { awb } = await req.json();
  if (!awb || !awb.trim()) {
    return NextResponse.json({ success: false, error: "Nomor AWB / Barcode wajib diisi" }, { status: 400 });
  }

  const result = await scanAndValidateAWB(session.token, session.user.agentStaffId, awb.trim());
  return NextResponse.json(result);
}