import { describe, it, expect } from "vitest";
import { getOutgoingPendingIds } from "./search-utils";

describe("getOutgoingPendingIds", () => {
  it("includes outgoing request targets — people I already sent a request to", () => {
    const ids = getOutgoingPendingIds([
      { id: "r1", direction: "outgoing", user: { id: "u1", name: "Alice" } },
    ]);
    expect(ids.has("u1")).toBe(true);
  });

  it("excludes incoming requests — the exact regression this fixes", () => {
    // "u2" sent *me* a request; I have not sent them one, so they must not
    // show up as "already requested" in search results.
    const ids = getOutgoingPendingIds([
      { id: "r2", direction: "incoming", user: { id: "u2", name: "Bob" } },
    ]);
    expect(ids.has("u2")).toBe(false);
  });

  it("handles a mix of both directions correctly", () => {
    const ids = getOutgoingPendingIds([
      { id: "r1", direction: "outgoing", user: { id: "u1", name: "Alice" } },
      { id: "r2", direction: "incoming", user: { id: "u2", name: "Bob" } },
    ]);
    expect(ids.has("u1")).toBe(true);
    expect(ids.has("u2")).toBe(false);
  });
});
