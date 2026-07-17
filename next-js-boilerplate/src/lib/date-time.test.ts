import { describe, expect, it } from "vitest";
import { getMonthNames, MONTHS } from "./date-time";

describe("getMonthNames", () => {
  it("returns the 12 English long month names by default", () => {
    expect(getMonthNames("en")).toEqual([...MONTHS]);
  });

  it("returns short month names", () => {
    const months = getMonthNames("en", "short");
    expect(months).toHaveLength(12);
    expect(months[2]).toBe("Mar");
  });

  it("localizes month names", () => {
    const months = getMonthNames("tr");
    expect(months[0]).toBe("Ocak");
    expect(months[5]).toBe("Haziran");
  });
});
