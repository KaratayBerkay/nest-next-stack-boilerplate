// @vitest-environment node
//
// Regression for the token-exposure fix: the login response body must carry
// only { user, deviceToken } — the access/rbac/user/refresh tokens travel
// exclusively as httpOnly cookies. Echoing them in JSON handed any XSS a
// durable bearer usable directly against the backend.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const graphqlFetchMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/backend", () => ({
  graphqlFetch: graphqlFetchMock,
  graphqlErrorBody: (errors: unknown, fallback: string) => ({
    statusCode: 500,
    msg: fallback,
  }),
}));
vi.mock("@/lib/session-user-cookie", () => ({
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

const LOGIN_PAYLOAD = {
  accessToken: "at-secret",
  rbacToken: "rt-secret",
  deviceId: "d1",
  deviceToken: "dt-crypto-seed",
  userToken: "ut-secret",
  refreshToken: "rft-secret",
  user: { id: "u1", email: "a@b.c" },
};

function makeRequest() {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "a@b.c", password: "hunter2hunter2" }),
    headers: { "content-type": "application/json" },
  });
}

describe("BFF /api/auth/login", () => {
  beforeEach(() => {
    graphqlFetchMock.mockReset();
    graphqlFetchMock
      .mockResolvedValueOnce({ data: { login: LOGIN_PAYLOAD } })
      // ME_QUERY overlay for the session_user snapshot.
      .mockResolvedValueOnce({
        data: { me: { id: "u1", email: "a@b.c", sessionId: "s1" } },
      });
  });

  it("never echoes bearer tokens in the response body — only user + deviceToken (the wire-crypto seed)", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.user).toBeTruthy();
    expect(body.deviceToken).toBe("dt-crypto-seed");
    expect(body).not.toHaveProperty("accessToken");
    expect(body).not.toHaveProperty("rbacToken");
    expect(body).not.toHaveProperty("userToken");
    expect(body).not.toHaveProperty("refreshToken");
  });

  it("still sets the access_token cookie (the tokens' only transport)", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest());

    const setCookies = res.headers.getSetCookie().join("\n");
    expect(setCookies).toContain("access_token=at-secret");
    expect(setCookies).toContain("refresh_token=rft-secret");
  });
});
