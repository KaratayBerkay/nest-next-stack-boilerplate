// @vitest-environment node
//
// Regression for the token-exposure fix: /api/auth/me returns the session
// snapshot only — never the raw access token (it used to echo it on all
// three response paths, handing any XSS a durable bearer).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const getAccessTokenMock = vi.fn();
const graphqlFetchMock = vi.fn();
const cookieGetMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/store/ssr-cookies", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/lib/backend", () => ({ graphqlFetch: graphqlFetchMock }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: cookieGetMock }),
}));
vi.mock("@/lib/session-user-cookie", () => ({
  decodeSessionUserCookie: (value: string) => JSON.parse(value),
  encodeSessionUserCookie: (v: unknown) => `signed.${JSON.stringify(v)}`,
}));
vi.mock("@/lib/request-logger", () => ({
  withLogging:
    (handler: (req: Request, log: unknown) => Promise<Response>) =>
    (req: Request) =>
      handler(req, {
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined,
      }),
}));

function makeRequest() {
  return new NextRequest("http://localhost/api/auth/me");
}

describe("BFF /api/auth/me", () => {
  beforeEach(() => {
    getAccessTokenMock.mockReset();
    graphqlFetchMock.mockReset();
    cookieGetMock.mockReset();
    getAccessTokenMock.mockResolvedValue("at-secret");
  });

  it("fast path (valid session_user cookie) returns the user without the access token", async () => {
    cookieGetMock.mockReturnValue({
      value: JSON.stringify({ id: "u1", sessionId: "s1" }),
    });
    const { GET } = await import("./route");
    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.user).toMatchObject({ id: "u1" });
    expect(body).not.toHaveProperty("accessToken");
  });

  it("GraphQL fallback path also returns the user without the access token", async () => {
    cookieGetMock.mockReturnValue(undefined);
    graphqlFetchMock.mockResolvedValue({
      data: { me: { id: "u1", sessionId: "s1" } },
    });
    const { GET } = await import("./route");
    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.user).toMatchObject({ id: "u1" });
    expect(body).not.toHaveProperty("accessToken");
    expect(JSON.stringify(body)).not.toContain("at-secret");
  });
});
