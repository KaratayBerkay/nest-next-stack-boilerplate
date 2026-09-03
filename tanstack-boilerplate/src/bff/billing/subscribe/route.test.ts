// @vitest-environment node
//
// BE-019: a first subscription whose card needs 3DS is not a decline — the
// route must hand the PaymentIntent client secret to the page instead of
// 402ing, and real declines must carry a readable i18n key + the reason.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const graphqlFetchMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "access_token" ? { value: "at-secret" } : undefined,
  }),
}));
vi.mock("@/lib/cookie", () => ({
  ACCESS_TOKEN_COOKIE: "access_token",
  SESSION_USER_COOKIE: "session_user",
  sessionUserCookieOptions: (value: string) => ({
    name: "session_user",
    value,
  }),
}));
vi.mock("@/lib/backend", () => ({
  graphqlFetch: (...args: unknown[]) => graphqlFetchMock(...args),
  csrfEchoHeaders: async () => undefined,
  graphqlErrorBody: (errors: unknown, fallback: string) => ({
    statusCode: 500,
    msg: fallback,
  }),
}));
vi.mock("@/lib/kafka", () => ({ publishEvent: vi.fn() }));
vi.mock("@/lib/session-user-cookie", () => ({
  encodeSessionUserCookie: (v: unknown) => `signed.${JSON.stringify(v)}`,
  decodeSessionUserCookie: () => ({}),
}));

import { POST } from "./route";
import { POST as FINALIZE } from "./finalize/route";

function request(url: string, body: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("BFF /api/billing/subscribe (BE-019)", () => {
  beforeEach(() => graphqlFetchMock.mockReset());

  it("passes authentication_required through as requiresAction instead of a 402", async () => {
    graphqlFetchMock.mockResolvedValueOnce({
      data: {
        subscribeToPlan: {
          success: false,
          reason: "authentication_required",
          clientSecret: "pi_1_secret_x",
          stripeSubscriptionId: "sub_1",
        },
      },
    });
    const res = await POST(
      request("/api/billing/subscribe", {
        tier: "BASIC",
        paymentMethodId: "pm_1",
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: false,
      requiresAction: true,
      clientSecret: "pi_1_secret_x",
      stripeSubscriptionId: "sub_1",
    });
  });

  it("maps a decline reason to an i18n key and never echoes the raw code as the message", async () => {
    graphqlFetchMock.mockResolvedValueOnce({
      data: {
        subscribeToPlan: { success: false, reason: "insufficient_funds" },
      },
    });
    const res = await POST(
      request("/api/billing/subscribe", {
        tier: "BASIC",
        paymentMethodId: "pm_1",
      }),
    );
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body).toMatchObject({
      exc: "EX_BILLING_DECLINED",
      key: "billing.errors.insufficientFunds",
      reason: "insufficient_funds",
    });
    expect(body.msg).not.toBe("insufficient_funds");
  });
});

describe("BFF /api/billing/subscribe/finalize (BE-019)", () => {
  beforeEach(() => graphqlFetchMock.mockReset());

  it("rejects a missing stripeSubscriptionId", async () => {
    const res = await FINALIZE(request("/api/billing/subscribe/finalize", {}));
    expect(res.status).toBe(400);
    expect(graphqlFetchMock).not.toHaveBeenCalled();
  });

  it("calls finalizeSubscription and re-syncs the session snapshot on success", async () => {
    graphqlFetchMock
      .mockResolvedValueOnce({
        data: {
          finalizeSubscription: {
            success: true,
            periodEnd: "2026-10-03T00:00:00Z",
          },
        },
      })
      .mockResolvedValueOnce({
        data: { me: { id: "u1", email: "a@b.c", tier: "BASIC" } },
      });
    const res = await FINALIZE(
      request("/api/billing/subscribe/finalize", {
        stripeSubscriptionId: "sub_1",
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      ok: true,
      periodEnd: "2026-10-03T00:00:00Z",
    });
    expect(graphqlFetchMock.mock.calls[0][1]).toEqual({
      stripeSubscriptionId: "sub_1",
    });
    expect(res.cookies.get("session_user")?.value).toContain('"tier":"BASIC"');
  });

  it("surfaces a still-pending authentication as requiresAction again", async () => {
    graphqlFetchMock.mockResolvedValueOnce({
      data: {
        finalizeSubscription: {
          success: false,
          reason: "authentication_required",
          clientSecret: "pi_1_secret_y",
        },
      },
    });
    const res = await FINALIZE(
      request("/api/billing/subscribe/finalize", {
        stripeSubscriptionId: "sub_1",
      }),
    );
    expect(await res.json()).toMatchObject({
      requiresAction: true,
      clientSecret: "pi_1_secret_y",
      stripeSubscriptionId: "sub_1",
    });
  });
});
