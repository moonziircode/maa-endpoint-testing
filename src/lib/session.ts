import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionData } from "./types";

const SECRET_KEY = process.env.SESSION_SECRET || "anteraja-maa-secure-session-encryption-key-2026!";
const key = new TextEncoder().encode(SECRET_KEY);
const COOKIE_NAME = "maa_session";

export async function encryptSession(data: SessionData): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decryptSession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as unknown as SessionData;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  return decryptSession(sessionCookie);
}

export async function setSession(data: SessionData) {
  const token = await encryptSession(data);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
