// @vitest-environment node
//
// This route runs server-side only (cookies-based auth, graphqlFetch) —
// jsdom (this repo's default vitest environment) isn't where it executes.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const graphqlFetchMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/store/ssr-cookies", () => ({
  getAccessToken: async () => "token-1",
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

function makeUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `u${i}`,
    name: `User ${i}`,
  }));
}

describe("GET /api/users/search", () => {
  beforeEach(() => {
    graphqlFetchMock.mockReset();
  });

  it("reports the true match count, not the 50-row fetch cap, when there are fewer than 50 matches", async () => {
    graphqlFetchMock
      .mockResolvedValueOnce({ data: { me: { id: "me" } } })
      .mockResolvedValueOnce({
        data: { users: makeUsers(12), usersCount: 12 },
      });

    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/users/search?q=a&take=10&skip=0"),
    );
    const body = await res.json();

    expect(body.total).toBe(12);
    expect(body.truncated).toBe(false);
    expect(body.items).toHaveLength(10);
  });

  it("caps total to the fetchable 50 and flags truncated when more than 50 users match", async () => {
    graphqlFetchMock
      .mockResolvedValueOnce({ data: { me: { id: "me" } } })
      .mockResolvedValueOnce({
        data: { users: makeUsers(50), usersCount: 200 },
      });

    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/users/search?q=a&take=10&skip=0"),
    );
    const body = await res.json();

    expect(body.total).toBe(50);
    expect(body.truncated).toBe(true);
  });

  it("does not flag truncated when the match count is exactly at the fetch cap", async () => {
    graphqlFetchMock
      .mockResolvedValueOnce({ data: { me: { id: "me" } } })
      .mockResolvedValueOnce({
        data: { users: makeUsers(50), usersCount: 50 },
      });

    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/users/search?q=a&take=10&skip=0"),
    );
    const body = await res.json();

    expect(body.total).toBe(50);
    expect(body.truncated).toBe(false);
  });

  it("does not select email in the users search query — regression: this route used to select+return email from a global, non-friends-scoped search, leaking every matched user's real address to any authenticated caller", async () => {
    graphqlFetchMock
      .mockResolvedValueOnce({ data: { me: { id: "me" } } })
      .mockResolvedValueOnce({
        data: { users: makeUsers(3), usersCount: 3 },
      });

    const { GET } = await import("./route");
    await GET(
      new NextRequest("http://localhost/api/users/search?q=a&take=10&skip=0"),
    );

    const searchCall = graphqlFetchMock.mock.calls[1]!;
    const searchQuery = searchCall[0] as string;
    expect(searchQuery).not.toMatch(/\bemail\b/);
  });
});
