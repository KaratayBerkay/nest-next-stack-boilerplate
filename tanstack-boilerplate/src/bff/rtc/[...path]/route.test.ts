// @vitest-environment node
//
// This route runs server-side only (cookies(), fetch to the backend) — jsdom
// (this repo's default vitest environment) isn't where it actually executes.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const fetchMock = vi.fn();
const getAccessTokenMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/store/ssr-cookies", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/lib/env", () => ({
  serverEnv: () => ({ APP_URL: "http://backend.internal" }),
}));
vi.mock("@/lib/backend", () => ({
  isSafeProxyPath: (path: string[]) =>
    path.every(
      (s) => s.length > 0 && s !== "." && s !== ".." && !/[/\\]/.test(s),
    ),
  sessionTokenHeaders: async () => ({}),
  parseProxiedResponse: async (res: Response) =>
    NextResponse.json(await res.json(), { status: res.status }),
}));

function makeRequest(path: string) {
  return new NextRequest(`http://localhost/api/rtc/${path}`, {
    method: "GET",
  });
}

describe("BFF /api/rtc/[...path]", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    getAccessTokenMock.mockReset();
    getAccessTokenMock.mockResolvedValue("access-token-1");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
  });

  it("forwards a normal path to the backend under /api/rtc/", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("meetings"), {
      params: Promise.resolve({ path: ["meetings"] }),
    });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://backend.internal/api/rtc/meetings");
  });

  it("rejects a decoded path segment hiding a traversal sequence (e.g. an encoded %2F) with 400, without forwarding to the backend — Next.js decodes [...path] segments before the handler sees them, so an on-the-wire `..%2F..%2Fhealth` segment arrives here as the literal string '../../health'", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("meetings"), {
      params: Promise.resolve({ path: ["../../health"] }),
    });

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a literal '..' segment too, as defense in depth", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("meetings"), {
      params: Promise.resolve({ path: ["..", "health"] }),
    });

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
