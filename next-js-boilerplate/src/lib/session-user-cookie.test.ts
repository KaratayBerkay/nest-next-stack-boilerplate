// @vitest-environment node
//
// serverEnv() guards against being called with a `window` global present
// (a real client/server boundary check) — jsdom (this repo's default vitest
// environment) defines `window`, so this file opts into the plain `node`
// environment instead, matching where this module actually runs.
import { beforeAll, describe, expect, it, vi } from "vitest";

// The real "server-only" package throws unconditionally unless resolved
// under Next's build-time "react-server" condition, which plain Vite/Vitest
// doesn't set — mock it to a no-op rather than changing global vitest
// resolution config (which risks affecting how react/react-dom resolve for
// every other, jsdom-based test in this suite).
vi.mock("server-only", () => ({}));

const { encodeSessionUserCookie, decodeSessionUserCookie } =
  await import("./session-user-cookie");

// serverEnv() reads process.env lazily (only when actually called, inside
// the it() blocks below) rather than at import time, so stubbing here in
// beforeAll — which runs before any it() but after this file's imports are
// evaluated — is sufficient; no dynamic import needed.
beforeAll(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("APP_URL", "http://localhost:3000");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3001");
  vi.stubEnv("COOKIE_SAMESITE", "lax");
  vi.stubEnv("KAFKA_BROKER", "localhost:9092");
  vi.stubEnv(
    "SESSION_COOKIE_SECRET",
    "test-session-cookie-secret-at-least-32-chars",
  );
});

describe("session-user-cookie", () => {
  const user = { id: "u1", email: "a@example.com", sessionId: "s1" };

  it("round-trips a value", () => {
    const encoded = encodeSessionUserCookie(user);
    expect(encoded).not.toContain('"email"'); // opaque, not raw JSON
    expect(decodeSessionUserCookie(encoded)).toEqual(user);
  });

  it("is deterministic: the same input always encodes to the same cookie", () => {
    expect(encodeSessionUserCookie(user)).toBe(encodeSessionUserCookie(user));
  });

  it("is url-safe (only base64url chars and one separating dot)", () => {
    expect(encodeSessionUserCookie(user)).toMatch(
      /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    );
  });

  it("returns null (not throw) for a tampered signature", () => {
    const encoded = encodeSessionUserCookie(user);
    const [payload, signature] = encoded.split(".");
    const flipped =
      signature.slice(0, -1) + (signature.at(-1) === "A" ? "B" : "A");
    expect(decodeSessionUserCookie(`${payload}.${flipped}`)).toBeNull();
  });

  it("returns null (not throw) for a tampered payload", () => {
    const encoded = encodeSessionUserCookie(user);
    const [payload, signature] = encoded.split(".");
    const flipped = payload.slice(0, -1) + (payload.at(-1) === "A" ? "B" : "A");
    expect(decodeSessionUserCookie(`${flipped}.${signature}`)).toBeNull();
  });

  it("returns null (not throw) for malformed input with no signature", () => {
    expect(decodeSessionUserCookie("not-a-real-cookie")).toBeNull();
  });

  it("returns null (not throw) for an empty string", () => {
    expect(decodeSessionUserCookie("")).toBeNull();
  });
});
