import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTasklist } from "@/lib/anteraja-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "dropoff";
  const key = searchParams.get("key") || searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "20", 10);

  let status = "WAITING_FOR_HANDOVER_SERAH";
  if (tab === "tertunda") {
    status = "ON_HOLD";
  } else if (tab === "sudah_serah") {
    status = "SUDAH_SERAH";
  }

  const result = await getTasklist(session.token, {
    tab: tab as any,
    status,
    state: "ACTIVE",
    key,
    page,
    size
  });

  return NextResponse.json(result);
}
