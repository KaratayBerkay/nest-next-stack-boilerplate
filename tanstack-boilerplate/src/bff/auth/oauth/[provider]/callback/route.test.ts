// @vitest-environment node
//
// This route runs server-side only (cookies(), graphqlFetch) — jsdom (this
// repo's default vitest environment) isn't where it actually executes.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const graphqlFetchMock = vi.fn();
const cookiesMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));
vi.mock("@/lib/backend", () => ({
  graphqlFetch: graphqlFetchMock,
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

describe("GET /api/auth/oauth/[provider]/callback", () => {
  beforeEach(() => {
    graphqlFetchMock.mockReset();
    cookiesMock.mockReset();
  });

  it("redirects to login with oauth_unavailable for a CRLF-smuggling provider segment, without ever reading cookies or calling the backend", async () => {
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/auth/oauth/x/callback?state=abc"),
      { params: Promise.resolve({ provider: "google\r\nSet-Cookie: evil=1" }) },
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://app.example.com/auth/login?error=oauth_unavailable",
    );
    expect(cookiesMock).not.toHaveBeenCalled();
    expect(graphqlFetchMock).not.toHaveBeenCalled();
  });

  it("still rejects a missing state for a valid provider (unaffected by the new guard)", async () => {
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/auth/oauth/google/callback"),
      { params: Promise.resolve({ provider: "google" }) },
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://app.example.com/auth/login?error=missing_state",
    );
  });

  it("redirects with missing_claim when the backend redirect carried a matching state but no claim — CROSS-032: the claim is the one-time secret only the browser that completed the provider handshake ever sees, so state alone must never reach loginWithOAuth", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "abc" }),
      delete: vi.fn(),
    });
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest(
        "http://localhost/api/auth/oauth/google/callback?state=abc",
      ),
      { params: Promise.resolve({ provider: "google" }) },
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://app.example.com/auth/login?error=missing_claim",
    );
    expect(graphqlFetchMock).not.toHaveBeenCalled();
  });

  it("forwards both state and claim to loginWithOAuth and surfaces the backend's rejection", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "abc" }),
      delete: vi.fn(),
    });
    graphqlFetchMock.mockResolvedValue({
      errors: [{ message: "OAuth claim rejected" }],
    });
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest(
        "http://localhost/api/auth/oauth/google/callback?state=abc&claim=one-time-secret",
      ),
      { params: Promise.resolve({ provider: "google" }) },
    );

    expect(graphqlFetchMock).toHaveBeenCalledTimes(1);
    expect(graphqlFetchMock.mock.calls[0][1]).toEqual({
      input: { state: "abc", claim: "one-time-secret" },
    });
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location") ?? "");
    expect(location.pathname).toBe("/auth/login");
    expect(location.searchParams.get("error")).toBe("OAuth claim rejected");
  });
});
