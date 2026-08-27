// @vitest-environment node
//
// This route runs server-side only (cookies(), graphqlFetch) — jsdom (this
// repo's default vitest environment) isn't where it actually executes.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const graphqlFetchMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "access_token" ? { value: "token-1" } : undefined,
  }),
}));
vi.mock("@/lib/backend", () => ({
  graphqlFetch: graphqlFetchMock,
  graphqlErrorBody: (
    _errors: unknown,
    defaultMsg?: string,
  ): { statusCode: number; msg: string } => ({
    statusCode: 500,
    msg: defaultMsg ?? "Internal server error",
  }),
}));
vi.mock("@/lib/cookie", () => ({ ACCESS_TOKEN_COOKIE: "access_token" }));

describe("GET /api/admin/search-users", () => {
  beforeEach(() => {
    graphqlFetchMock.mockReset();
  });

  it("returns adminSearchUsers results under `items`, not the stale `users` field name", async () => {
    graphqlFetchMock
      .mockResolvedValueOnce({ data: { me: { id: "admin-1", role: "ADMIN" } } })
      .mockResolvedValueOnce({
        data: {
          adminSearchUsers: [
            {
              id: "u2",
              name: "Bob",
              email: "bob@example.com",
              role: "USER",
              status: "BANNED",
              subscriptionTier: "FREE",
            },
          ],
        },
      });

    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/admin/search-users?q=bob"),
    );
    const body = await res.json();

    expect(body).toEqual({
      items: [
        {
          id: "u2",
          name: "Bob",
          email: "bob@example.com",
          role: "USER",
          status: "BANNED",
          subscriptionTier: "FREE",
        },
      ],
    });
  });

  it("excludes the calling admin from the results even if the backend ever returned them", async () => {
    graphqlFetchMock
      .mockResolvedValueOnce({ data: { me: { id: "admin-1", role: "ADMIN" } } })
      .mockResolvedValueOnce({
        data: {
          adminSearchUsers: [
            {
              id: "admin-1",
              name: "Self",
              email: "self@example.com",
              role: "ADMIN",
              status: "ACTIVE",
              subscriptionTier: "FREE",
            },
            {
              id: "u2",
              name: "Bob",
              email: "bob@example.com",
              role: "USER",
              status: "ACTIVE",
              subscriptionTier: "FREE",
            },
          ],
        },
      });

    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/admin/search-users?q=b"),
    );
    const body = await res.json();

    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe("u2");
  });

  it("returns 403 for a non-admin caller without ever calling the search query", async () => {
    graphqlFetchMock.mockResolvedValueOnce({
      data: { me: { id: "u1", role: "USER" } },
    });

    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/admin/search-users?q=bob"),
    );

    expect(res.status).toBe(403);
    expect(graphqlFetchMock).toHaveBeenCalledTimes(1);
  });
});
