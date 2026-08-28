import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getShipmentTracking } from "@/lib/anteraja-api";

export async function GET(req: NextRequest, { params }: { params: { awb: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const awb = params.awb;
  if (!awb) {
    return NextResponse.json({ success: false, error: "Nomor AWB wajib diisi" }, { status: 400 });
  }

  const result = await getShipmentTracking(session.token, session.user.agentStaffId, awb);
  if (!result) {
    return NextResponse.json({
      success: false,
      error: "Nomor AWB tidak ditemukan di sistem tracking Anteraja"
    }, { status: 404 });
  }

  return NextResponse.json({ success: true, ...result });
}
