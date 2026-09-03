// @vitest-environment node
//
// Regression for the cross-site device-reset gap: this route is pre-auth
// and sets the device_token cookie, so a cross-site form POST could
// force-rotate a victim's device identity (trusted-device reset, wire-crypto
// re-key). Sec-Fetch-Site gates it.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const backendFetchMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/backend", () => ({ backendFetch: backendFetchMock }));

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/auth/device-handshake", {
    method: "POST",
    headers,
  });
}

describe("BFF /api/auth/device-handshake", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
    backendFetchMock.mockResolvedValue({
      ok: true,
      data: { deviceToken: "dt-1" },
    });
  });

  it("rejects a cross-site request without touching the backend or cookies", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ "sec-fetch-site": "cross-site" }));

    expect(res.status).toBe(403);
    expect(backendFetchMock).not.toHaveBeenCalled();
    expect(res.headers.getSetCookie()).toHaveLength(0);
  });

  it("serves same-origin requests normally", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ "sec-fetch-site": "same-origin" }));

    expect(res.status).toBe(200);
    expect((await res.json()).deviceToken).toBe("dt-1");
    expect(res.headers.getSetCookie().join("\n")).toContain(
      "device_token=dt-1",
    );
  });

  it("lets header-less legacy clients through", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });
});
