// @vitest-environment node
//
// This route runs server-side only (cookies(), backendFormFetch) — jsdom
// (this repo's default vitest environment) isn't where it actually executes.
import { describe, it, expect, vi, beforeEach } from "vitest";

const backendFormFetchMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "access_token" ? { value: "token-1" } : undefined,
  }),
}));
vi.mock("@/lib/backend", () => ({
  backendFormFetch: backendFormFetchMock,
}));
vi.mock("@/lib/cookie", () => ({ ACCESS_TOKEN_COOKIE: "access_token" }));

function makeRequest(file: File) {
  const formData = new FormData();
  formData.set("file", file);
  return new Request("http://localhost/api/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/upload", () => {
  beforeEach(() => {
    backendFormFetchMock.mockReset();
    backendFormFetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      data: { urls: { full: "https://cdn.example.com/a.avif" } },
    });
  });

  it("accepts an AVIF image instead of rejecting it as an unsupported type", async () => {
    const { POST } = await import("./route");
    const file = new File(["x"], "photo.avif", { type: "image/avif" });

    const res = await POST(makeRequest(file));

    expect(res.status).toBe(201);
    expect(backendFormFetchMock).toHaveBeenCalledOnce();
  });

  it("still rejects a genuinely unsupported type", async () => {
    const { POST } = await import("./route");
    const file = new File(["x"], "clip.mp4", { type: "video/mp4" });

    const res = await POST(makeRequest(file));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("AVIF");
    expect(backendFormFetchMock).not.toHaveBeenCalled();
  });
});
