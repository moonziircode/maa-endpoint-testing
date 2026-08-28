import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { calculateRates } from "@/lib/anteraja-api";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { origin, destination, weight, length, width, height } = await req.json();
  if (!origin || !destination) {
    return NextResponse.json({ success: false, error: "Origin dan Destination district wajib diisi" }, { status: 400 });
  }

  const result = await calculateRates(
    session.token,
    origin,
    destination,
    parseFloat(weight) || 1.0,
    parseFloat(length) || 10.0,
    parseFloat(width) || 10.0,
    parseFloat(height) || 10.0
  );

  return NextResponse.json(result);
}
