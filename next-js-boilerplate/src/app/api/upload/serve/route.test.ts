// @vitest-environment node
//
// This route runs server-side only (cookies(), fetch to the backend) — jsdom
// (this repo's default vitest environment) isn't where it actually executes.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const fetchMock = vi.fn();
const getAccessTokenMock = vi.fn();

vi.mock("@/store/ssr-cookies", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/lib/env", () => ({
  serverEnv: () => ({ APP_URL: "http://backend.internal" }),
}));
vi.mock("@/lib/backend", () => ({
  sessionTokenHeaders: async () => ({}),
}));

function makeRequest(objectName?: string) {
  const qs = objectName ? `?objectName=${encodeURIComponent(objectName)}` : "";
  return new NextRequest(`http://localhost/api/upload/serve${qs}`);
}

describe("BFF /api/upload/serve", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    getAccessTokenMock.mockReset();
    getAccessTokenMock.mockResolvedValue("access-token-1");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "image/png" },
      }),
    );
  });

  it("400s without an objectName", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("serves decrypted bytes with a PRIVATE cache directive, never public — a shared cache (prod openresty, corporate proxy) storing this response would replay one user's decrypted attachment to another, bypassing the backend's per-user authorization", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("chat/a1/b2.png"));

    expect(res.status).toBe(200);
    const cacheControl = res.headers.get("cache-control") ?? "";
    expect(cacheControl).toContain("private");
    expect(cacheControl).not.toContain("public");
  });

  it("passes the backend Content-Type through", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("chat/a1/b2.png"));
    expect(res.headers.get("content-type")).toBe("image/png");
  });
});
