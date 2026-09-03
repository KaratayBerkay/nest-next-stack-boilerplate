import type { Dispatch, SetStateAction } from "react";
import type { CurrencyCode } from "@/constants/currency";
import { CURRENCY_COOKIE } from "@/constants/currency";
import type { DateDisplayFormat } from "@/constants/date-display";
import { DATE_DISPLAY_COOKIE } from "@/constants/date-display";
import type { ToastOptions } from "@/types/ui/Toast-types";

type ToastFn = (opts: ToastOptions) => string;

type UpdateProfileFn = (data: {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
}) => Promise<void>;

export function setCurrency(
  code: CurrencyCode,
  setCurrencyState: Dispatch<SetStateAction<CurrencyCode>>,
) {
  setCurrencyState(code);
  document.cookie = `${CURRENCY_COOKIE}=${code};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function setDateDisplay(
  format: DateDisplayFormat,
  setDateDisplayState: Dispatch<SetStateAction<DateDisplayFormat>>,
) {
  setDateDisplayState(format);
  document.cookie = `${DATE_DISPLAY_COOKIE}=${format};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export async function saveSettings(
  setSaving: Dispatch<SetStateAction<boolean>>,
  locale: string,
  timezone: string,
  toast: ToastFn,
  saveSuccess: string,
  saveFailed: string,
  refreshUser: () => Promise<void>,
  updateProfile: UpdateProfileFn,
  /**
   * Runs after a successful save with the locale that was persisted. The
   * page uses it to actually switch the UI language (cookie + navigation,
   * same as the header LangSwitcher) — without it the setting was saved to
   * the profile and then only ever read back to pre-fill this dropdown
   * (CROSS-019).
   */
  applyLocale?: (locale: string) => void,
) {
  setSaving(true);
  try {
    await updateProfile({ locale, timezone });
    toast({ title: saveSuccess, variant: "success" });
    await refreshUser();
    applyLocale?.(locale);
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({ title: exception?.msg ?? saveFailed, variant: "destructive" });
  } finally {
    setSaving(false);
  }
}
