import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { validatePromoCode } from "@/lib/anteraja-api";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { promoCode, taskCode } = await req.json();
  if (!promoCode) {
    return NextResponse.json({ valid: false, message: "Kode promo wajib diisi" }, { status: 400 });
  }

  const result = await validatePromoCode(session.token, promoCode, taskCode);
  return NextResponse.json(result);
}
