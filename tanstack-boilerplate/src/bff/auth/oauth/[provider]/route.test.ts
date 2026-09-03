// @vitest-environment node
//
// This route runs server-side only (cookies(), fetch to the backend) — jsdom
// (this repo's default vitest environment) isn't where it actually executes.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const fetchMock = vi.fn();
const cookieSetMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ set: cookieSetMock }),
}));
vi.mock("@/lib/env", () => ({
  serverEnv: () => ({
    APP_URL: "http://backend.internal",
    NEXT_PUBLIC_APP_URL: "https://app.example.com",
  }),
}));
vi.mock("@/lib/request-logger", () => ({
  withLogging:
    (handler: (request: unknown, log: unknown) => unknown) =>
    (request: unknown) =>
      handler(request, { warn: vi.fn(), info: vi.fn(), error: vi.fn() }),
}));

describe("GET /api/auth/oauth/[provider]", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    cookieSetMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("redirects to login with oauth_unavailable for a CRLF-smuggling provider segment, without setting a cookie or calling the backend", async () => {
    const { GET } = await import("./route");
    const res = await GET(new NextRequest("http://localhost/api/auth/oauth/x"), {
      params: Promise.resolve({ provider: "google\r\nSet-Cookie: evil=1" }),
    });

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://app.example.com/auth/login?error=oauth_unavailable",
    );
    expect(cookieSetMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a path-traversal-shaped provider segment the same way", async () => {
    const { GET } = await import("./route");
    const res = await GET(new NextRequest("http://localhost/api/auth/oauth/x"), {
      params: Promise.resolve({ provider: "../../etc/passwd" }),
    });

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://app.example.com/auth/login?error=oauth_unavailable",
    );
    expect(cookieSetMock).not.toHaveBeenCalled();
  });

  it("still initiates a real provider normally", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: "https://accounts.google.com/o/oauth2/v2/auth" },
      }),
    );

    const { GET } = await import("./route");
    const res = await GET(new NextRequest("http://localhost/api/auth/oauth/google"), {
      params: Promise.resolve({ provider: "google" }),
    });

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(cookieSetMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/auth/oauth/google?");
  });
});
