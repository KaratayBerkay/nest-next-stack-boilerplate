// @vitest-environment node
//
// This route runs server-side only (cookies(), fetch to the backend) — jsdom
// (this repo's default vitest environment) isn't where it actually executes.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const fetchMock = vi.fn();
const csrfEchoHeadersMock = vi.fn();
const getAccessTokenMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/store/ssr-cookies", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/lib/env", () => ({
  serverEnv: () => ({ APP_URL: "http://backend.internal" }),
}));
vi.mock("@/lib/backend", () => ({
  csrfEchoHeaders: csrfEchoHeadersMock,
  isSafeProxyPath: (path: string[]) =>
    path.every(
      (s) => s.length > 0 && s !== "." && s !== ".." && !/[/\\]/.test(s),
    ),
  sessionTokenHeaders: async () => ({}),
  parseProxiedResponse: async (res: Response) =>
    NextResponse.json(await res.json(), { status: res.status }),
}));

function makeRequest(method: string, path: string) {
  return new NextRequest(`http://localhost/api/messages/${path}`, {
    method,
    ...(method === "POST"
      ? { body: JSON.stringify({ hello: "world" }) }
      : {}),
  });
}

describe("BFF /api/messages/[...path]", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    csrfEchoHeadersMock.mockReset();
    getAccessTokenMock.mockReset();
    getAccessTokenMock.mockResolvedValue("access-token-1");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
  });

  it("GET never needs a CSRF token", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("GET", "favorite"), {
      params: Promise.resolve({ path: ["favorite"] }),
    });

    expect(res.status).toBe(200);
    expect(csrfEchoHeadersMock).not.toHaveBeenCalled();
  });

  it("GET rejects a decoded path segment hiding a traversal sequence (e.g. an encoded %2F) with 400, without forwarding to the backend — Next.js decodes [...path] segments before the handler sees them, so an on-the-wire `..%2Fhealth` segment arrives here as the literal string '../health'", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("GET", "favorite"), {
      params: Promise.resolve({ path: ["../health"] }),
    });

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POST rejects the same traversal segment with 400 before even checking CSRF", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest("POST", "favorite"), {
      params: Promise.resolve({ path: ["..", "admin"] }),
    });

    expect(res.status).toBe(400);
    expect(csrfEchoHeadersMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POST blocks with a clean 403 when the CSRF handshake fails, without forwarding to the backend", async () => {
    csrfEchoHeadersMock.mockResolvedValueOnce(null);

    const { POST } = await import("./route");
    const res = await POST(makeRequest("POST", "favorite"), {
      params: Promise.resolve({ path: ["favorite"] }),
    });

    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POST echoes the CSRF headers through to the backend call", async () => {
    csrfEchoHeadersMock.mockResolvedValueOnce({
      "x-csrf-token": "tok-1",
      cookie: "__Host-csrf=tok-1",
    });

    const { POST } = await import("./route");
    const res = await POST(makeRequest("POST", "favorite"), {
      params: Promise.resolve({ path: ["favorite"] }),
    });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0]!;
    expect((init.headers as Record<string, string>)["x-csrf-token"]).toBe(
      "tok-1",
    );
  });
});
