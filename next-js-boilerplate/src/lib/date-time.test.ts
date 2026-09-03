import { describe, expect, it, afterEach } from "vitest";
import {
  getMonthNames,
  MONTHS,
  formatDateLong,
  formatDateTime,
  formatDateShort,
  formatDateTimeShort,
  formatDateByPreference,
  formatDateTimeByPreference,
  formatDurationShort,
  formatTimeShort,
  getCurrentLocale,
  getTimezone,
  formatDate,
  type DateDisplayPreference,
} from "./date-time";
import { setTimezoneCookie } from "./timezone-cookie";

describe("getCurrentLocale", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    document.cookie = "lang=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
  });

  it("reads the language segment from the current pathname", () => {
    window.history.replaceState(null, "", "/v1/tr/feed");
    expect(getCurrentLocale()).toBe("tr");
  });

  it("falls back to the lang cookie when the pathname has no language segment", () => {
    window.history.replaceState(null, "", "/no-lang-segment");
    document.cookie = "lang=tr";
    expect(getCurrentLocale()).toBe("tr");
  });

  it("defaults to en when neither the pathname nor the cookie has a language", () => {
    window.history.replaceState(null, "", "/no-lang-segment");
    expect(getCurrentLocale()).toBe("en");
  });
});

describe("date formatters default to the site's language, not the browser's", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("formatDateLong follows the /tr/ URL segment when locale is omitted", () => {
    window.history.replaceState(null, "", "/v1/tr/feed");
    const d = new Date(2026, 0, 15);
    expect(formatDateLong(d)).toBe(formatDateLong(d, "tr"));
    expect(formatDateLong(d)).not.toBe(formatDateLong(d, "en"));
  });
});

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

describe("formatTimeShort", () => {
  it("formats using Intl's short time style, no date part", () => {
    const d = new Date(2026, 6, 9, 14, 5);
    const expected = new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
    }).format(d);
    expect(formatTimeShort(d, "en-US")).toBe(expected);
    expect(formatTimeShort(d, "en-US")).not.toContain("2026");
  });
});

describe("formatDurationShort", () => {
  const start = new Date("2026-08-28T10:00:00Z");
  const at = (ms: number) => new Date(start.getTime() + ms);

  it("renders sub-minute spans in seconds", () => {
    expect(formatDurationShort(start, at(45_000))).toBe("45s");
  });

  it("renders minute spans", () => {
    expect(formatDurationShort(start, at(42 * 60_000))).toBe("42m");
  });

  it("renders hour spans with and without a minute remainder", () => {
    expect(formatDurationShort(start, at(72 * 60_000))).toBe("1h 12m");
    expect(formatDurationShort(start, at(120 * 60_000))).toBe("2h");
  });

  it("clamps a negative span to 0s instead of rendering nonsense", () => {
    expect(formatDurationShort(at(5_000), start)).toBe("0s");
  });
});

// CROSS-019: the profile timezone drives rendering, not the browser's zone.
describe("preferred timezone (profile setting)", () => {
  afterEach(() => setTimezoneCookie(null));

  it("renders wall-clock times in the cookie's zone", () => {
    setTimezoneCookie("Asia/Tokyo");
    // 00:00Z is 09:00 in Tokyo.
    expect(formatTimeShort("2026-09-03T00:00:00Z", "en-US")).toBe("9:00 AM");
    expect(formatDateTimeShort("2026-09-03T00:00:00Z", "en-US")).toContain(
      "9:00 AM",
    );
    expect(getTimezone()).toBe("Asia/Tokyo");
  });

  it("moves the calendar date across midnight in the preferred zone", () => {
    setTimezoneCookie("Pacific/Kiritimati"); // UTC+14
    expect(formatDate("2026-09-03T22:00:00Z", "en-US")).toBe("9/4/2026");
    expect(formatDateLong("2026-09-03T22:00:00Z", "en-US")).toBe(
      "September 4, 2026",
    );
  });

  it("ignores an invalid zone and falls back to the environment", () => {
    setTimezoneCookie("Mars/Olympus_Mons");
    expect(document.cookie).not.toContain("Mars");
    expect(getTimezone()).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  });
});
