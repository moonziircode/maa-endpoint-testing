import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { initiatePayment } from "@/lib/anteraja-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { taskCode, amount, promoCode, paymentCode } = await req.json();
  if (!taskCode || !amount) {
    return NextResponse.json({ success: false, error: "Task Code dan nominal wajib diisi" }, { status: 400 });
  }

  const result = await initiatePayment(
    session.token,
    session.user.agentStaffId,
    taskCode,
    parseFloat(amount),
    promoCode || "",
    paymentCode || "006"
  );

  return NextResponse.json(result);
}