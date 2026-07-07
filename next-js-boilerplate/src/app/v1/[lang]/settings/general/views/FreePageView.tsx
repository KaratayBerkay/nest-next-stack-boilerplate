"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

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

export function FreePageView() {
  const { user, loading, refreshUser } = useAuth();
  const t = useMessages("settings");
  const { toast } = useToast();

  const [locale, setLocale] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    setLocale(user.locale ?? "en");
    setTimezone(user.timezone ?? "UTC");
  }, [user]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await apiFetchJson("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, timezone }),
      });
      toast({ title: t.saveSuccess, variant: "success" });
      await refreshUser();
    } catch (err) {
      const exception = (err as Error & { exception?: { msg?: string } }).exception;
      toast({ title: exception?.msg ?? t.saveFailed, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [locale, timezone, toast, t.saveSuccess, t.saveFailed, refreshUser]);

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message="Sign in to manage settings" />;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h2 className="text-lg font-semibold">{t.generalHeading}</h2>

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
      </div>

      <Button
        onClick={save}
        disabled={saving}
        variant="primary"
        className="self-start"
      >
        {saving ? t.saving : t.save}
      </Button>
    </div>
  );
}
