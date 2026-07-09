"use client";

import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { CURRENCIES, CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/constants/currency";
import type { CurrencyCode } from "@/constants/currency";
import { PROFILE_UPDATE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsGeneralPageInfo } from "@/constants/page-info";

function readCurrencyCookie(): CurrencyCode {
  if (typeof document === "undefined") return DEFAULT_CURRENCY;
  const match = document.cookie.match(new RegExp(`${CURRENCY_COOKIE}=([^;]+)`));
  const val = match?.[1];
  if (val && (CURRENCIES as readonly string[]).includes(val)) {
    return val as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

const LOCALES = [
  { value: "en", label: "English" },
  { value: "tr", label: "Türkçe" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

function setCurrency(
  code: CurrencyCode,
  setCurrencyState: Dispatch<SetStateAction<CurrencyCode>>,
) {
  setCurrencyState(code);
  document.cookie = `${CURRENCY_COOKIE}=${code};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

async function save(
  setSaving: Dispatch<SetStateAction<boolean>>,
  locale: string,
  timezone: string,
  toast: ReturnType<typeof useToast>["toast"],
  saveSuccess: string,
  saveFailed: string,
  refreshUser: () => Promise<void>,
) {
  setSaving(true);
  try {
    await apiFetchJson(PROFILE_UPDATE_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ locale, timezone }),
    });
    toast({ title: saveSuccess, variant: "success" });
    await refreshUser();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } }).exception;
    toast({ title: exception?.msg ?? saveFailed, variant: "destructive" });
  } finally {
    setSaving(false);
  }
}

export function FreePageView() {
  const { user, loading, refreshUser } = useAuth();
  const t = useMessages("settings");
  const { toast } = useToast();

  const [locale, setLocale] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [currency, setCurrencyState] = useState<CurrencyCode>(readCurrencyCookie);
  const [saving, setSaving] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    setLocale(user.locale ?? "en");
    setTimezone(user.timezone ?? "UTC");
  }, [user]);

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInToManageSettings} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.generalHeading}</h2>
        <PageInfoButton content={settingsGeneralPageInfo} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>{t.language}</Label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="border-border bg-bg rounded-lg border px-3 py-2 text-sm"
          >
            {LOCALES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t.timezone}</Label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="border-border bg-bg rounded-lg border px-3 py-2 text-sm"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t.theme}</Label>
            <ThemeToggle />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t.currency}</Label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode, setCurrencyState)}
              className="border-border bg-bg rounded-lg border px-3 py-2 text-sm"
            >
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="TRY">Turkish Lira (₺)</option>
            </select>
          </div>
      </div>

      <Button
        onClick={() => save(setSaving, locale, timezone, toast, t.saveSuccess, t.saveFailed, refreshUser)}
        disabled={saving}
        variant="primary"
        className="self-start"
      >
        {saving ? t.saving : t.save}
      </Button>
    </div>
  );
}
