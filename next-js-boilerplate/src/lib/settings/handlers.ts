import type { Dispatch, SetStateAction } from "react";
import type { CurrencyCode } from "@/constants/currency";
import { CURRENCY_COOKIE } from "@/constants/currency";
import type { DateDisplayFormat } from "@/constants/date-display";
import { DATE_DISPLAY_COOKIE } from "@/constants/date-display";
import type { ToastOptions } from "@/types/ui/Toast-types";

type ToastFn = (opts: ToastOptions) => string;

type UpdateProfileFn = (data: {
  name: string;
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
) {
  setSaving(true);
  try {
    await updateProfile({ name: "", locale, timezone });
    toast({ title: saveSuccess, variant: "success" });
    await refreshUser();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({ title: exception?.msg ?? saveFailed, variant: "destructive" });
  } finally {
    setSaving(false);
  }
}
