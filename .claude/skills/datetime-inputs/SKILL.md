---
name: datetime-inputs
description: Date and time UI for this repo's frontend (next-js-boilerplate) — Calendar (react-day-picker v10), DatePicker, TimeInput, and the @/lib/date-time helpers. Use whenever building or changing ANYTHING involving dates or times: pickers, calendars, scheduling or booking UIs, due-date fields, timestamps, relative time ("2 hours ago"), date ranges, timezones, or date formatting — even if the user just says "add a deadline field" or "show when it was created". Covers controlled value/onChange conventions, the Calendar events pattern, 12/24-hour TimeInput, timezone and locale providers, and which existing helper to use instead of hand-rolling Date math.
---

# Date & Time Inputs

Everything date/time already has infrastructure here: three input components, a 30-function helper library, and timezone/locale providers. The cardinal rule is **don't hand-roll Date math or `toLocaleString` calls in components** — extend `@/lib/date-time` if a helper is missing, so formatting stays consistent and locale-aware across the app.

Paths relative to `next-js-boilerplate/`.

## The existing pieces

| Piece | Where | What it is |
|---|---|---|
| `Calendar` | `src/components/ui/calendar/` | Wrapper over **react-day-picker v10** with an `events` prop + `CalendarEvent` rendering |
| `DatePicker` | `src/components/ui/date-picker/` | Trigger button + inline-positioned `Calendar` panel, `formatDateLong` display |
| `TimeInput` | `src/components/ui/time-input/` | Native `<select>`-based hh:mm(:ss), 12/24-hour via `use24Hour` |
| helpers | `src/lib/date-time.ts` | All formatting/arithmetic (below) |
| providers | `TimezoneProvider`, `ClientLocaleProvider` in `src/components/` | timezone + locale context |
| types | `src/types/ui/Calendar-types.ts`, `DatePicker-types.ts`, `TimeInput-types.ts` | props contracts |
| demos | `src/views/ui/calendar/`, `date-picker/`, `time-input/` | showcase pages |

## The helper library — use it

`src/lib/date-time.ts` accepts `DateInput = string | number | Date` everywhere and formats via `Intl` (locale-aware). Grouped:

- **Now/today**: `getNow`, `nowMs`, `getToday(format)`, `toISOString`
- **Formatting**: `formatDate`, `formatDateTime`, `formatDateLong`, `getRelativeTime` ("2 hours ago"), `formatHoursMinutes`, `getDateParts`, `getTime(timezone?)`
- **Comparison**: `isSameDay`, `isToday`, `sortByDateAsc/Desc`
- **Arithmetic**: `addDays`, `addMonths`, `startOfDay`, `endOfDay`, `getDaysInMonth`, `getFirstWeekdayOfMonth`
- **Constants**: `MONTHS`, `DAYS_SHORT`
- **Parsing**: `convertTextToDate`

Before writing any date logic, scan this file — the function almost certainly exists. If not, add it *here* with the same `DateInput` signature and a unit test, then use it.

## Component conventions

**Controlled with plain `Date`.** Inputs take `value?: Date` and `onChange?: (d: Date) => void` (TimeInput uses hours/minutes numbers) plus `placeholder`, `variant` resolved through `useComponentVariant`, and the `fontSize`/`fontWeight`/`fontFamily` trio — the same API shape as the rest of the library (see the **ui-components** skill). Internal-only state (panel open/closed) stays internal.

**Calendar events pattern.** `Calendar` accepts `events: { date: Date, ... }[]`, filters them per day (`getEventsForDate` compares y/m/d, not timestamps), and renders them through the `CalendarEvent` subcomponent. Extend event rendering there, not by forking DayPicker internals.

**TimeInput is native selects on purpose** — keyboard and mobile accessible with zero popover code. Follow that spirit: reach for a custom popover time-picker only if a real requirement (e.g. 15-min slot granularity from an API) forces it.

## react-day-picker v10 caution

The installed version is `^10.0.1`, newer than most training data. Core props are stable (`mode="single" | "multiple" | "range"`, `selected`, `onSelect`, `classNames`, `components`), but **verify anything beyond those against the installed package** — `node_modules/react-day-picker/dist/**/*.d.ts` or its README — before using it. Don't guess prop names from v8/v9 memory; the `classNames` keys in particular have churned between majors. Style DayPicker via its `classNames` prop with semantic tokens, matching `calendar/calendar.tsx`.

For a range or multi-date picker, extend the existing components: add a mode/type in `src/types/ui/DatePicker-types.ts` and pass the corresponding `mode` down — don't build a parallel picker.

## Timezones, locale, SSR

- **Store UTC, display local.** API boundaries exchange ISO strings (`toISOString`); convert for display only, via the helpers + `TimezoneProvider` context (`getTimezone`, `getTime(timezone)`).
- Formatting helpers take an optional `locale` — thread it from `ClientLocaleProvider` rather than hardcoding `"en"`.
- **Hydration:** anything rendering "now" (relative times, clocks, today-highlighting) differs between server render and client. Either mark it `"use client"` and gate on mount (the `useSyncExternalStore` mounted trick in `dialog-content.tsx`), or render a stable placeholder server-side. A hydration mismatch warning on a timestamp is this bug.

## Forms

Forms use **TanStack Form + Zod v4**. Keep `Date` objects in form state, validate with `z.date()` (or `z.iso.datetime()` for string fields — Zod v4 moved string-format validators under `z.iso`), and serialize with `toISOString()` only at the submit boundary.
