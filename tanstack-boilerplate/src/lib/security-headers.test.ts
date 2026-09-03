// Regression for the "tanstack ships no global security headers" gap: the
// app previously had NO X-Frame-Options / nosniff / HSTS / CSP outside the
// /security/* nonce demo, leaving every page clickjackable while the Next.js
// twin carried a full set via next.config.ts.
import { describe, it, expect } from "vitest";
import { securityHeadersFor, STATIC_CSP } from "./security-headers";

describe("securityHeadersFor", () => {
  it("applies the full global set on an ordinary page", () => {
    const h = securityHeadersFor("/v1/en/feed");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Strict-Transport-Security"]).toContain("max-age=63072000");
    expect(h["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(h["Content-Security-Policy"]).toBe(STATIC_CSP);
    expect(h["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(h["Permissions-Policy"]).toContain("camera=()");
  });

  it("relaxes only Permissions-Policy on RTC paths (getUserMedia + screen share need it)", () => {
    const h = securityHeadersFor("/v1/en/rtc/meetings");
    expect(h["Permissions-Policy"]).toBe(
      "camera=(self), microphone=(self), display-capture=(self)",
    );
    // Everything else stays strict.
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Content-Security-Policy"]).toBe(STATIC_CSP);
  });

  it("does not treat lookalike paths as RTC", () => {
    expect(securityHeadersFor("/v1/en/rtc-gallery")["Permissions-Policy"]).toContain(
      "camera=()",
    );
    expect(securityHeadersFor("/rtc")["Permissions-Policy"]).toContain(
      "camera=()",
    );
  });
});
