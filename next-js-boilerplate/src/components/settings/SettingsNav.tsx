"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  IconAdjustments,
  IconUser,
  IconShieldLock,
  IconCreditCard,
  IconDevices,
  IconKey,
} from "@tabler/icons-react";

const TABS = [
  { href: "general", labelKey: "navGeneral", Icon: IconAdjustments },
  { href: "account", labelKey: "navAccount", Icon: IconUser },
  { href: "privacy", labelKey: "navPrivacy", Icon: IconShieldLock },
  { href: "billing", labelKey: "navBilling", Icon: IconCreditCard },
  { href: "api-keys", labelKey: "navApiKeys", Icon: IconKey },
  { href: "sessions", labelKey: "navSessions", Icon: IconDevices },
] as const;

export function SettingsNav() {
  const params = useParams<{ lang: string }>();
  const pathname = usePathname();
  const t = useMessages("settings");
  const base = `/v1/${params?.lang ?? ""}/settings`;

  return (
    <nav
      className="grid grid-cols-3 gap-2 md:block md:w-48 md:shrink-0 md:gap-0.5"
      aria-label="Settings"
    >
      {TABS.map(({ href, labelKey, Icon }) => {
        const full = `${base}/${href}`;
        const active = pathname === full;
        return (
          <Link
            key={href}
            href={full}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors md:justify-start ${
              active
                ? "bg-brand/10 text-brand font-medium"
                : "text-muted hover:bg-surface-hover"
            }`}
          >
            <Icon size={18} stroke={1.5} />
            <span>{t[labelKey] as string}</span>
          </Link>
        );
      })}
    </nav>
  );
}
