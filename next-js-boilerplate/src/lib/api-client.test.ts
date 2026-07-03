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
    vi.stubGlobal("fetch", vi.fn(async () => response(500)));
    await expect(apiFetchJson("/api/thing")).rejects.toThrow("500");
  });
});
