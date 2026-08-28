import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDropoffOrder } from "@/lib/anteraja-api";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const result = await createDropoffOrder(session.token, session.user.agentStaffId, payload);
  return NextResponse.json(result);
}
