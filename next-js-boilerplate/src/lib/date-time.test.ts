import { describe, expect, it } from "vitest";
import {
  getMonthNames,
  MONTHS,
  formatDateLong,
  formatDateTime,
  formatDateShort,
  formatDateTimeShort,
  formatDateByPreference,
  formatDateTimeByPreference,
  type DateDisplayPreference,
} from "./date-time";

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

describe("formatDateShort", () => {
  it("formats using Intl's short date style", () => {
    const d = new Date(2026, 6, 9);
    const expected = new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
    }).format(d);
    expect(formatDateShort(d, "en-US")).toBe(expected);
  });
});

describe("formatDateTimeShort", () => {
  it("formats using Intl's short date+time style", () => {
    const d = new Date(2026, 6, 9, 14, 5);
    const expected = new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
    expect(formatDateTimeShort(d, "en-US")).toBe(expected);
  });
});

describe("formatDateByPreference", () => {
  const d = new Date(2026, 6, 9);

  it("iso returns the full ISO string", () => {
    expect(formatDateByPreference(d, "iso")).toBe(d.toISOString());
  });

  it("long matches today's default (formatDateLong)", () => {
    expect(formatDateByPreference(d, "long", "en-US")).toBe(
      formatDateLong(d, "en-US"),
    );
  });

  it("short matches formatDateShort", () => {
    expect(formatDateByPreference(d, "short", "en-US")).toBe(
      formatDateShort(d, "en-US"),
    );
  });

  it("falls back to long for an unrecognized preference", () => {
    expect(
      formatDateByPreference(d, "bogus" as DateDisplayPreference, "en-US"),
    ).toBe(formatDateLong(d, "en-US"));
  });

  it("falls back to current date instead of throwing for an unparseable input", () => {
    const result = formatDateByPreference("not-a-date", "iso");
    expect(result).not.toBe("Invalid Date");
    expect(() => new Date(result)).not.toThrow();
  });
});

describe("formatDateTimeByPreference", () => {
  const d = new Date(2026, 6, 9, 14, 5);

  it("iso returns the full ISO string", () => {
    expect(formatDateTimeByPreference(d, "iso")).toBe(d.toISOString());
  });

  it("long matches today's default (formatDateTime)", () => {
    expect(formatDateTimeByPreference(d, "long", "en-US")).toBe(
      formatDateTime(d, "en-US"),
    );
  });

  it("short matches formatDateTimeShort", () => {
    expect(formatDateTimeByPreference(d, "short", "en-US")).toBe(
      formatDateTimeShort(d, "en-US"),
    );
  });
});
