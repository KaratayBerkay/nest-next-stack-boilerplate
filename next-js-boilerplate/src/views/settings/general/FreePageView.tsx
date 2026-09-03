"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
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
import {
  detectLang,
  isLang,
  localizePathname,
  setLangCookie,
} from "@/lib/i18n/lang-routing";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Make the saved language take effect: the profile field alone never did
  // anything on web (the header LangSwitcher's cookie + /{lang}/ navigation
  // is the real switch), so a user picking Turkish here kept seeing English.
  const applyLocale = useCallback(
    (target: string) => {
      if (!isLang(target)) return;
      const current = detectLang(pathname ?? "");
      if (current === target) return;
      setLangCookie(target);
      const localized = localizePathname(pathname ?? "", current, target);
      const qs = searchParams.toString();
      router.push(qs ? `${localized}?${qs}` : localized);
    },
    [pathname, searchParams, router],
  );

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

            <SettingsSelect
              label={t.dateDisplay}
              value={dateDisplay}
              onChange={(v) =>
                setDateDisplay(v as DateDisplayFormat, setDateDisplayState)
              }
              options={[
                {
                  value: "long",
                  label: `${t.dateDisplayLong} (${formatDateLong(now)})`,
                },
                {
                  value: "iso",
                  label: `${t.dateDisplayIso} (${toISOString(now)})`,
                },
                {
                  value: "short",
                  label: `${t.dateDisplayShort} (${formatDateShort(now)})`,
                },
              ]}
            />
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
                applyLocale,
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
