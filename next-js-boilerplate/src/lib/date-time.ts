import { LANGS, DEFAULT_LANG } from "@/constants/i18n";
import { readLangCookie } from "@/lib/read-lang-cookie";

export type DateInput = string | number | Date;

// Passing no `locale` to Intl falls back to the *browser's* language, not
// this site's selected one — a user browsing the Turkish UI with an
// English-language browser saw every date rendered in English regardless.
// Almost every formatter below previously left `locale` unset entirely.
export function getCurrentLocale(): string {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const seg = window.location.pathname
    .split("/")
    .find((s) => (LANGS as readonly string[]).includes(s));
  return seg ?? readLangCookie();
}

export type TodayFormat =
  "ISO" | "only_date" | "year" | "month" | "day" | "weekday";

export type DateField<T> = (item: T) => DateInput;

function toDate(input?: DateInput): Date {
  if (!input) return new Date();
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return new Date();
    return input;
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

export function getNow(): Date {
  return new Date();
}

export function nowMs(): number {
  return Date.now();
}

export function toISOString(input?: DateInput): string {
  return toDate(input).toISOString();
}

/**
 * `YYYY-MM-DD` in the *local* calendar day — not `toISOString().slice(0, 9)`,
 * which converts to UTC first and can shift the date by one day for anyone
 * west of UTC. Matches the shape `<input type="date">` and this app's
 * `DatePicker`/`DateRangePicker` day-click values already use.
 */
export function formatDateOnly(input: DateInput): string {
  const d = toDate(input);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getToday(type: TodayFormat): string | number {
  const now = new Date();
  switch (type) {
    case "ISO":
      return now.toISOString();
    case "only_date":
      return now.toISOString().split("T")[0];
    case "year":
      return now.getFullYear();
    case "month":
      return now.getMonth() + 1;
    case "day":
      return now.getDate();
    case "weekday":
      return now.getDay();
  }
}

export function formatDate(
  input: DateInput,
  locale: string = getCurrentLocale(),
): string {
  return toDate(input).toLocaleDateString(locale);
}

export function formatDateTime(
  input: DateInput,
  locale: string = getCurrentLocale(),
): string {
  return toDate(input).toLocaleString(locale);
}

export function formatDateLong(
  input: DateInput,
  locale: string = getCurrentLocale(),
): string {
  return toDate(input).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatMonthYear(
  input: DateInput,
  locale: string = getCurrentLocale(),
): string {
  return toDate(input).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
  });
}

export type DateDisplayPreference = "long" | "iso" | "short";

export function formatDateShort(
  input: DateInput,
  locale: string = getCurrentLocale(),
): string {
  return toDate(input).toLocaleDateString(locale, { dateStyle: "short" });
}

export function formatDateTimeShort(
  input: DateInput,
  locale: string = getCurrentLocale(),
): string {
  return toDate(input).toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatDateByPreference(
  input: DateInput,
  preference: DateDisplayPreference,
  locale?: string,
): string {
  switch (preference) {
    case "iso":
      try {
        return toISOString(input);
      } catch {
        return "Invalid Date";
      }
    case "short":
      return formatDateShort(input, locale);
    case "long":
    default:
      return formatDateLong(input, locale);
  }
}

export function formatDateTimeByPreference(
  input: DateInput,
  preference: DateDisplayPreference,
  locale?: string,
): string {
  switch (preference) {
    case "iso":
      try {
        return toISOString(input);
      } catch {
        return "Invalid Date";
      }
    case "short":
      return formatDateTimeShort(input, locale);
    case "long":
    default:
      return formatDateTime(input, locale);
  }
}

export function getRelativeTime(input: DateInput): string {
  const diff = Date.now() - toDate(input).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function getDateParts(input: DateInput) {
  const d = toDate(input);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: d.getDay(),
    hours: d.getHours(),
    minutes: d.getMinutes(),
    seconds: d.getSeconds(),
  };
}

export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getTime(timezone?: string): string {
  return new Date().toLocaleString(
    "en-US",
    timezone ? { timeZone: timezone } : undefined,
  );
}

export function convertTextToDate(
  txt: string,
  to?: "iso" | "date" | "epoch",
): string | number | Date {
  const d = new Date(txt);
  if (isNaN(d.getTime())) throw new Error(`Invalid date string: ${txt}`);
  switch (to) {
    case "iso":
      return d.toISOString();
    case "epoch":
      return d.getTime();
    default:
      return d;
  }
}

export function sortByDateAsc<T>(arr: T[], getDate: DateField<T>): T[] {
  return [...arr].sort(
    (a, b) => toDate(getDate(a)).getTime() - toDate(getDate(b)).getTime(),
  );
}

export function sortByDateDesc<T>(arr: T[], getDate: DateField<T>): T[] {
  return [...arr].sort(
    (a, b) => toDate(getDate(b)).getTime() - toDate(getDate(a)).getTime(),
  );
}

export function isSameDay(a: DateInput, b: DateInput): boolean {
  const da = toDate(a);
  const db = toDate(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function isToday(input: DateInput): boolean {
  return isSameDay(input, new Date());
}

export function addDays(date: DateInput, days: number): Date {
  const d = toDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: DateInput, months: number): Date {
  const d = toDate(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function startOfDay(date: DateInput): Date {
  const d = toDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: DateInput): Date {
  const d = toDate(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function formatHoursMinutes(hours: number, minutes: number): string {
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export function getMonthNames(
  locale: string = getCurrentLocale(),
  month: "long" | "short" = "long",
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month });
  return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2000, i, 1)));
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
