import { describe, expect, it } from "vitest";
import { fetchUncached } from "./dedup";

describe("dedup", () => {
  it("uncached function runs its body on every call", async () => {
    const [a, b] = await Promise.all([
      fetchUncached("key-a"),
      fetchUncached("key-a"),
    ]);
    // Each call increments the counter independently.
    expect(a.callCount).toBe(1);
    expect(b.callCount).toBe(2);
  });
});
