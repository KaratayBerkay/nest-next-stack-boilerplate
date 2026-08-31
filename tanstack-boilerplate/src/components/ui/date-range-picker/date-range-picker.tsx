"use client";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { usePopover } from "@/components/ui/popover/popover";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useFieldMessages } from "@/components/ui/field-messages";
import { useLang } from "@/hooks/useLang";
import type { Lang } from "@/constants/i18n";
import { formatDateByPreference } from "@/lib/date-time";
import type { DateDisplayPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import type {
  DateRangePickerProps,
  DateRangeValue,
} from "@/types/ui/DateRangePicker-types";

const variants = {
  ...globalStyleVariants,
  default: "border-border bg-bg text-fg hover:bg-surface-hover",
};

const LABELS: Record<Lang, { pickRange: string; clearRange: string }> = {
  en: {
    pickRange: "Pick a date range",
    clearRange: "Clear date range",
  },
  tr: {
    pickRange: "Tarih aralığı seçin",
    clearRange: "Tarih aralığını temizle",
  },
};

function defaultEndMonth() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 10);
  return d;
}

function formatRangeValue(
  value: DateRangeValue | undefined,
  locale: string | undefined,
  dateDisplay: DateDisplayPreference,
): string {
  if (!value?.from) return "";
  const from = formatDateByPreference(value.from, dateDisplay, locale);
  if (!value.to) return from;
  const to = formatDateByPreference(value.to, dateDisplay, locale);
  return `${from} – ${to}`;
}

function DateRangePickerCalendar({
  value,
  onChange,
  startMonth,
  endMonth,
}: {
  value?: DateRangeValue;
  onChange?: (range: DateRangeValue | undefined) => void;
  startMonth?: Date;
  endMonth?: Date;
}) {
  const { close, open } = usePopover();

  return (
    <div className="w-full">
      <Calendar
        mode="range"
        selected={value && { from: value.from, to: value.to }}
        captionLayout="dropdown"
        startMonth={startMonth ?? new Date(1900, 0, 1)}
        endMonth={endMonth ?? defaultEndMonth()}
        forceDropdownBottomSheet
        swipeDisabled={!open}
        onSelect={(range) => {
          onChange?.(range);
          // Auto-close once a full range is picked — a single click just
          // sets `from` (DayPicker's own range-selection behavior), so
          // closing early would strand the user before they can pick `to`.
          if (range?.from && range?.to) close();
        }}
      />
    </div>
  );
}

export function DateRangePicker({
  value,
  onChange,
  placeholder,
  className,
  fontSize,
  fontWeight,
  fontFamily,
  variant,
  error,
  description,
  startMonth,
  endMonth,
}: DateRangePickerProps) {
  const lang = useLang();
  const labels = LABELS[lang];
  const effectiveVariant = useComponentVariant(variant);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });
  const { describedBy, messages } = useFieldMessages(error, description);
  const dateDisplay = useDateDisplayCookie();
  const displayValue = formatRangeValue(value, lang, dateDisplay);
  const hasValue = !!(value?.from || value?.to);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-md border px-3 py-1 text-sm shadow-xs transition-colors",
              resolveVariant(variants, effectiveVariant),
              fonts,
            )}
            aria-describedby={describedBy}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted shrink-0"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span
              className={cn(
                "flex-1 truncate text-left tabular-nums",
                !hasValue && "text-muted",
              )}
            >
              {hasValue ? displayValue : (placeholder ?? labels.pickRange)}
            </span>
            {hasValue && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onChange?.(undefined);
                  }
                }}
                className="text-muted hover:text-fg inline-flex shrink-0 items-center justify-center rounded p-0.5 transition-colors"
                aria-label={labels.clearRange}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent title={labels.pickRange} forceBottomSheet>
          <DateRangePickerCalendar
            value={value}
            onChange={onChange}
            startMonth={startMonth}
            endMonth={endMonth}
          />
        </PopoverContent>
      </Popover>
      {messages}
    </div>
  );
}
