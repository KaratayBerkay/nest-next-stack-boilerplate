import { describe, it, expect } from "vitest";
import { matchesFriendSearch } from "../FriendPickList";

const friend = { id: "f1", name: "Alice Johnson", email: "alice@example.com" };

describe("matchesFriendSearch", () => {
  it("matches on name and email, case-insensitively", () => {
    expect(matchesFriendSearch(friend, "alice")).toBe(true);
    expect(matchesFriendSearch(friend, "JOHNSON")).toBe(true);
    expect(matchesFriendSearch(friend, "example.com")).toBe(true);
  });

  it("empty or whitespace query matches everyone", () => {
    expect(matchesFriendSearch(friend, "")).toBe(true);
    expect(matchesFriendSearch(friend, "   ")).toBe(true);
  });

  it("rejects non-matching queries", () => {
    expect(matchesFriendSearch(friend, "bob")).toBe(false);
  });
});
