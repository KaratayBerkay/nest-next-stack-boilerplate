import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";

// HMAC-signs the session_user cookie's payload so a tampered/forged value
// can't be trusted by the "fast path" in getSessionUser() / /api/auth/me
// (they skip a backend round-trip whenever this cookie parses). Signed, not
// encrypted: the content isn't secret from the account holder — it's a
// snapshot of their own profile — only tamper-evidence is needed. This was
// the one piece of session-adjacent state in the app with no cryptographic
// protection at all (every backend-issued token is either signed or
// encrypted); mirrors the backend's token-codec in intent, not construction.

function sign(payload: string): string {
  return createHmac("sha256", serverEnv().SESSION_COOKIE_SECRET)
    .update(payload)
    .digest("base64url");
}

/** Encodes a value into the signed, base64url cookie format. Never throws. */
export function encodeSessionUserCookie(value: unknown): string {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/**
 * Reverses {@link encodeSessionUserCookie}. Returns null — never throws —
 * for a missing signature, a bad signature, or malformed JSON, so every
 * call site can treat "couldn't trust this cookie" as one case (same
 * shape as the backend's decryptTokenOrNull).
 */
export function decodeSessionUserCookie<T>(value: string): T | null {
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = value.slice(0, dot);
  const signature = value.slice(dot + 1);

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as T;
  } catch {
    return null;
  }
}
