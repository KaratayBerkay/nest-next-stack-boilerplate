import { describe, it, expect } from "vitest";
import { insertRowKey, moveRowKey, removeRowKey } from "./EditableTable-utils";

describe("insertRowKey", () => {
  it("inserts a new key at the given position, shifting the rest down", () => {
    expect(insertRowKey(["a", "b", "c"], 1, "new")).toEqual([
      "a",
      "new",
      "b",
      "c",
    ]);
  });

  it("does not mutate the original array", () => {
    const keys = ["a", "b"];
    insertRowKey(keys, 1, "new");
    expect(keys).toEqual(["a", "b"]);
  });
});

describe("moveRowKey", () => {
  it("moves a key from one position to another", () => {
    expect(moveRowKey(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveRowKey(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("keeps a saved row's own key attached to it when it moves — the exact regression this fixes", () => {
    // Row "b" (key "k-b") was just saved; moving it up must keep "k-b"
    // pointing at "b", not at whatever key now sits at "b"'s old index.
    const keys = ["k-a", "k-b", "k-c"];
    const moved = moveRowKey(keys, 1, 0);
    expect(moved[0]).toBe("k-b");
  });
});

describe("removeRowKey", () => {
  it("removes the key at the given index, shifting the rest up", () => {
    expect(removeRowKey(["a", "b", "c"], 0)).toEqual(["b", "c"]);
  });

  it("keeps the remaining rows' keys attached to the right rows — the exact regression this fixes", () => {
    // Removing row "a" (index 0) must not leave "b"'s status mislabeled as
    // belonging to whatever now sits at index 0.
    const keys = ["k-a", "k-b", "k-c"];
    const after = removeRowKey(keys, 0);
    expect(after).toEqual(["k-b", "k-c"]);
  });
});
