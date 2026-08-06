"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsGeneralPageInfo } from "@/constants/page-info";
import { useProfileActions } from "@/api/client/profile/actions";
import { cn } from "@/lib/cn";
import {
  readCurrencyCookie,
  readDateDisplayCookie,
} from "@/lib/settings/cookies";
import { LOCALES, TIMEZONES, CURRENCY_OPTIONS } from "@/lib/settings/constants";
import {
  setCurrency,
  setDateDisplay,
  saveSettings,
} from "@/lib/settings/handlers";
import { SettingsSelect } from "./SettingsSelect";
import { formatDateLong, formatDateShort, toISOString } from "@/lib/date-time";
import type { CurrencyCode } from "@/constants/currency";
import type { DateDisplayFormat } from "@/constants/date-display";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

export function FreePageView({ className }: ClassNameProps) {
  const { user, loading, refreshUser } = useAuth();
  const t = useMessages("settings");
  const { toast } = useToast();
  const { updateProfile } = useProfileActions();

  const [locale, setLocale] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [currency, setCurrencyState] =
    useState<CurrencyCode>(readCurrencyCookie);
  const [dateDisplay, setDateDisplayState] = useState<DateDisplayFormat>(
    readDateDisplayCookie,
  );
  const [saving, setSaving] = useState(false);
  const loadedRef = useRef(false);
  const now = new Date();

  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    setLocale(user.locale ?? "en");
    setTimezone(user.timezone ?? "UTC");
  }, [user]);

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageSettings} />;

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title={t.generalHeading}
        actions={<PageInfoButton content={settingsGeneralPageInfo} />}
      />

      <Tabs defaultValue="general" className="flex w-full flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="general">{t.navGeneral}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <SettingsSelect
              label={t.language}
              value={locale}
              onChange={setLocale}
              options={LOCALES}
            />

            <SettingsSelect
              label={t.timezone}
              value={timezone}
              onChange={setTimezone}
              options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
            />

            <SettingsSelect
              label={t.currency}
              value={currency}
              onChange={(v) => setCurrency(v as CurrencyCode, setCurrencyState)}
              options={CURRENCY_OPTIONS}
            />

            <div className="flex flex-col gap-1.5">
              <Label>{t.dateDisplay}</Label>
              <select
                value={dateDisplay}
                onChange={(e) =>
                  setDateDisplay(
                    e.target.value as DateDisplayFormat,
                    setDateDisplayState,
                  )
                }
                className="border-border bg-bg rounded-lg border px-3 py-2 text-sm"
              >
                <option value="long">{`${t.dateDisplayLong} (${formatDateLong(now)})`}</option>
                <option value="iso">{`${t.dateDisplayIso} (${toISOString(now)})`}</option>
                <option value="short">{`${t.dateDisplayShort} (${formatDateShort(now)})`}</option>
              </select>
            </div>
          </div>

          <Button
            onClick={() =>
              saveSettings(
                setSaving,
                locale,
                timezone,
                toast,
                t.saveSuccess,
                t.saveFailed,
                refreshUser,
                updateProfile,
              )
            }
            disabled={saving}
            variant="primary"
            className="self-start"
          >
            {saving ? t.saving : t.save}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
