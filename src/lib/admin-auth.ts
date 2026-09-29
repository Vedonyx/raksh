import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "raksh_admin_session";
const ttl = 60 * 60 * 8;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin session secret is missing");
  return secret;
}

export function verifyAdminCredentials(email: string, password: string) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !stored) throw new Error("Admin credentials are missing");
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex || !/^[a-f\d]{128}$/i.test(expectedHex)) throw new Error("Invalid admin password hash");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return email.trim().toLowerCase() === configuredEmail && timingSafeEqual(actual, expected);
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export async function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + ttl })).toString("base64url");
  (await cookies()).set(cookieName, `${payload}.${signature(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ttl,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}

export async function hasAdminSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return false;
  try {
    const [payload, received] = token.split(".");
    if (!payload || !received) return false;
    const actual = Buffer.from(received, "base64url");
    const expected = Buffer.from(signature(payload), "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new URL(request.url).origin;
  return origin === allowed;
}

export function adminLoginKey(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return createHmac("sha256", sessionSecret()).update(ip).digest("hex");
}
