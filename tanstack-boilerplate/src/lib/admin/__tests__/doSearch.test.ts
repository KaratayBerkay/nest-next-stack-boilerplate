import { describe, it, expect, vi } from "vitest";
import { doSearch } from "../admin-utils";

const searchAdminUsersServerMock = vi.fn();

vi.mock("@/api/server/admin/search-users", () => ({
  searchAdminUsersServer: (q: string) => searchAdminUsersServerMock(q),
}));

describe("doSearch stale-response guard", () => {
  it("does not let an earlier query's late response overwrite a later query's results", async () => {
    let resolveFirst!: (v: { id: string }[]) => void;
    searchAdminUsersServerMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );
    searchAdminUsersServerMock.mockImplementationOnce(() =>
      Promise.resolve([{ id: "second-result" }]),
    );

    const setResults = vi.fn();
    const setSearching = vi.fn();
    const requestId = { current: 0 };

    const firstCall = doSearch("alice", setResults, setSearching, requestId);
    const secondCall = doSearch("bob", setResults, setSearching, requestId);
    await secondCall;

    expect(setResults).toHaveBeenCalledWith([{ id: "second-result" }]);
    setResults.mockClear();

    // The stale first request finally resolves — it must not be applied.
    resolveFirst([{ id: "first-result" }]);
    await firstCall;

    expect(setResults).not.toHaveBeenCalled();
  });

  it("does not let a stale request clear the loading indicator early", async () => {
    let resolveFirst!: (v: { id: string }[]) => void;
    searchAdminUsersServerMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );
    searchAdminUsersServerMock.mockImplementationOnce(
      () => new Promise(() => {}), // never resolves in this test
    );

    const setResults = vi.fn();
    const setSearching = vi.fn();
    const requestId = { current: 0 };

    const firstCall = doSearch("alice", setResults, setSearching, requestId);
    void doSearch("bob", setResults, setSearching, requestId);

    resolveFirst([{ id: "first-result" }]);
    await firstCall;

    // setSearching(false) from the stale first request must not fire while
    // the second (current) search is still in flight.
    expect(setSearching).not.toHaveBeenCalledWith(false);
  });

  it("still applies the result when it's the only request in flight", async () => {
    searchAdminUsersServerMock.mockResolvedValueOnce([{ id: "only-result" }]);
    const setResults = vi.fn();
    const setSearching = vi.fn();
    const requestId = { current: 0 };

    await doSearch("alice", setResults, setSearching, requestId);

    expect(setResults).toHaveBeenCalledWith([{ id: "only-result" }]);
    expect(setSearching).toHaveBeenCalledWith(false);
  });
});
