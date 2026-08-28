import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { checkPaymentStatus } from "@/lib/anteraja-api";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { taskCode } = await req.json();
  if (!taskCode) {
    return NextResponse.json({ success: false, error: "Task Code wajib diisi" }, { status: 400 });
  }

  const result = await checkPaymentStatus(session.token, taskCode);
  return NextResponse.json(result);
}
