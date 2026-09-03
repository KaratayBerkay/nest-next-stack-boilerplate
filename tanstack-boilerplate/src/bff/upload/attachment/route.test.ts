// @vitest-environment node
//
// Server-only route (cookies(), backendFormFetch) — same setup as the
// sibling src/bff/upload/route.test.ts.
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

function makeRequest(file: File, headers: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("file", file);
  return new Request("http://localhost/api/upload/attachment", {
    method: "POST",
    body: formData,
    headers,
  });
}

// FE-012: this buffered route never forwarded the upload-scope headers its
// streamed sibling forwards, so a scoped upload through it lost its scope.
describe("POST /api/upload/attachment — scope header forwarding", () => {
  beforeEach(() => {
    backendFormFetchMock.mockReset();
    backendFormFetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      data: { url: "https://minio.local/bucket/a.pdf" },
    });
  });

  it("forwards x-scope-kind / x-scope-id to the backend when present", async () => {
    const { POST } = await import("./route");
    const file = new File(["x"], "a.pdf", { type: "application/pdf" });

    const res = await POST(
      makeRequest(file, { "x-scope-kind": "room", "x-scope-id": "general" }),
    );

    expect(res.status).toBe(201);
    const [, , init] = backendFormFetchMock.mock.calls[0] as [
      string,
      FormData,
      { headers?: Record<string, string> },
    ];
    expect(init.headers).toMatchObject({
      "x-scope-kind": "room",
      "x-scope-id": "general",
    });
  });

  it("sends no scope headers when the client sent none", async () => {
    const { POST } = await import("./route");
    const file = new File(["x"], "a.pdf", { type: "application/pdf" });

    await POST(makeRequest(file));

    const [, , init] = backendFormFetchMock.mock.calls[0] as [
      string,
      FormData,
      { headers?: Record<string, string> },
    ];
    expect(init.headers ?? {}).not.toHaveProperty("x-scope-kind");
    expect(init.headers ?? {}).not.toHaveProperty("x-scope-id");
  });
});
