import { describe, it, expect, vi, afterEach } from "vitest";
import { apiFetch, apiFetchJson } from "@/lib/api-client";

function response(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("passes a non-401 response through", async () => {
    const fetchMock = vi.fn(async () => response(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiFetch("/api/thing");

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("resolves a relative path against NEXT_PUBLIC_APP_URL when called server-side", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3100");
    const fetchMock = vi.fn(async () => response(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/api/billing/subscription");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3100/api/billing/subscription",
      expect.anything(),
    );
  });

  it("leaves a relative path as-is in the browser (window defined)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3100");
    const fetchMock = vi.fn(async () => response(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/api/billing/subscription");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/billing/subscription",
      expect.anything(),
    );
  });

  it("dispatches auth:logout on 401", async () => {
    const onLogout = vi.fn();
    window.addEventListener("auth:logout", onLogout);
    const fetchMock = vi.fn(async () => response(401));
    vi.stubGlobal("fetch", fetchMock);

    try {
      const res = await apiFetch("/api/thing");
      expect(res.status).toBe(401);
      expect(onLogout).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener("auth:logout", onLogout);
    }
  });

  it("dispatches auth:logout despite suppressGlobalLogout when the refresh endpoint rejects the session", async () => {
    const onLogout = vi.fn();
    window.addEventListener("auth:logout", onLogout);
    // request 401 → refresh answers a definitive 401 (dead refresh token)
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(401));
    vi.stubGlobal("fetch", fetchMock);

    try {
      const res = await apiFetch("/api/thing", undefined, {
        suppressGlobalLogout: true,
      });
      expect(res.status).toBe(401);
      expect(onLogout).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener("auth:logout", onLogout);
    }
  });

  it("honors suppressGlobalLogout when the refresh failure is transient", async () => {
    const onLogout = vi.fn();
    window.addEventListener("auth:logout", onLogout);
    // request 401 → refresh fails with a 500 (backend hiccup, not a dead session)
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(500));
    vi.stubGlobal("fetch", fetchMock);

    try {
      const res = await apiFetch("/api/thing", undefined, {
        suppressGlobalLogout: true,
      });
      expect(res.status).toBe(401);
      expect(onLogout).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("auth:logout", onLogout);
    }
  });
});

describe("apiFetchJson", () => {
  it("parses the JSON body on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response(200, { hello: "world" })),
    );
    await expect(apiFetchJson("/api/thing")).resolves.toEqual({
      hello: "world",
    });
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response(500)),
    );
    await expect(apiFetchJson("/api/thing")).rejects.toThrow("500");
  });
});
