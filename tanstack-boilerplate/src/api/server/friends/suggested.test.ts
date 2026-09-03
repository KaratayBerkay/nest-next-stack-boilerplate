import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiFetch: apiFetchMock,
}));

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    json: async () => payload,
  } as unknown as Response;
}

describe("fetchSuggestedFriendsServer", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("never selects email in the GraphQL query (PII leak regression)", async () => {
    apiFetchMock.mockResolvedValue(
      okResponse({ data: { suggestedFriends: [] } }),
    );
    const { fetchSuggestedFriendsServer } = await import("./suggested");

    await fetchSuggestedFriendsServer();

    const init = apiFetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string) as { query: string };
    expect(body.query).toContain("suggestedFriends");
    expect(body.query).not.toMatch(/\bemail\b/);
  });

  it("returns the suggested friends list unchanged", async () => {
    const rows = [
      { id: "u2", name: "Alice", avatarUrl: null, mutualFriends: 3 },
    ];
    apiFetchMock.mockResolvedValue(
      okResponse({ data: { suggestedFriends: rows } }),
    );
    const { fetchSuggestedFriendsServer } = await import("./suggested");

    await expect(fetchSuggestedFriendsServer()).resolves.toEqual(rows);
  });
});
