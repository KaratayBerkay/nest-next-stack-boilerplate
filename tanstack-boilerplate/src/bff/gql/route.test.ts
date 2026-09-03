// @vitest-environment node
//
// This route runs server-side only (cookies(), fetch to the backend) — jsdom
// (this repo's default vitest environment) isn't where it actually executes.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const fetchMock = vi.fn();
const csrfEchoHeadersMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "access_token" ? { value: "token-1" } : undefined,
  }),
}));
vi.mock("@/lib/env", () => ({
  serverEnv: () => ({ APP_URL: "http://backend.internal" }),
}));
vi.mock("@/lib/backend", () => ({
  csrfEchoHeaders: csrfEchoHeadersMock,
  forwardedForHeader: async () => ({}),
  sessionTokenHeaders: async () => ({}),
}));
vi.mock("@/lib/cookie", () => ({ ACCESS_TOKEN_COOKIE: "access_token" }));

function makeRequest(query: string) {
  return new NextRequest("http://localhost/api/gql", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

describe("POST /api/gql", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    csrfEchoHeadersMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }),
    );
  });

  it("never fetches a CSRF token for a plain query", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest("{ me { id } }"));

    expect(res.status).toBe(200);
    expect(csrfEchoHeadersMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("never fetches a CSRF token for a named query operation", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest("query Me { me { id } }"));

    expect(res.status).toBe(200);
    expect(csrfEchoHeadersMock).not.toHaveBeenCalled();
  });

  it("blocks a mutation with a clean 403 when the CSRF handshake fails, without forwarding it to the backend", async () => {
    csrfEchoHeadersMock.mockResolvedValueOnce(null);

    const { POST } = await import("./route");
    const res = await POST(makeRequest("mutation { deleteAccount }"));

    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("echoes the CSRF token header for a mutation and still forwards it", async () => {
    csrfEchoHeadersMock.mockResolvedValueOnce({
      "x-csrf-token": "tok-1",
      cookie: "__Host-csrf=tok-1",
    });

    const { POST } = await import("./route");
    const res = await POST(
      makeRequest("mutation DeleteAccount { deleteAccount }"),
    );

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0]!;
    expect((init.headers as Record<string, string>)["x-csrf-token"]).toBe(
      "tok-1",
    );
  });

  it("treats a whitespace-prefixed, named mutation the same as a bare one", async () => {
    csrfEchoHeadersMock.mockResolvedValueOnce({ "x-csrf-token": "tok-2" });

    const { POST } = await import("./route");
    const res = await POST(
      makeRequest("\n  mutation Foo($x: String) { foo(x: $x) }"),
    );

    expect(res.status).toBe(200);
    expect(csrfEchoHeadersMock).toHaveBeenCalledOnce();
  });
});
