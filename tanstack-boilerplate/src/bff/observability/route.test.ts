// @vitest-environment node
//
// Regression for the observability info-disclosure gate: span names, recent
// error strings and uptime are internal telemetry and must not be readable
// anonymously.
import { describe, it, expect, vi, beforeEach } from "vitest";

const getAccessTokenMock = vi.fn();

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("@/store/ssr-cookies", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/lib/observability", () => ({
  observabilityState: () => ({
    startedAt: 123,
    runtime: "nodejs",
    spans: [{ name: "observability.check" }],
    errors: [],
  }),
}));

describe("BFF /api/observability", () => {
  beforeEach(() => {
    getAccessTokenMock.mockReset();
  });

  it("401s without a session", async () => {
    getAccessTokenMock.mockResolvedValue(undefined);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("serves telemetry to a logged-in user", async () => {
    getAccessTokenMock.mockResolvedValue("at-1");
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json()).startedAt).toBe(123);
  });
});
