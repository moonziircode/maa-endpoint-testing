import { NextRequest, NextResponse } from "next/server";
import { loginCAS } from "@/lib/anteraja-api";
import { setSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: "NIA/Username dan Password wajib diisi" }, { status: 400 });
    }

    const result = await loginCAS(username, password);
    if (!result.success || !result.token || !result.user) {
      return NextResponse.json({ success: false, error: result.error || "Login gagal" }, { status: 401 });
    }

    await setSession({
      user: result.user,
      token: result.token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      message: "Login berhasil"
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
