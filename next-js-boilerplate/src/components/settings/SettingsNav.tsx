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
} from "@tabler/icons-react";

const TABS = [
  { href: "general", labelKey: "navGeneral", Icon: IconAdjustments },
  { href: "account", labelKey: "navAccount", Icon: IconUser },
  { href: "privacy", labelKey: "navPrivacy", Icon: IconShieldLock },
  { href: "billing", labelKey: "navBilling", Icon: IconCreditCard },
  { href: "sessions", labelKey: "navSessions", Icon: IconDevices },
] as const;

export function SettingsNav() {
  const params = useParams<{ lang: string }>();
  const pathname = usePathname();
  const t = useMessages("settings");
  const base = `/v1/${params?.lang ?? ""}/settings`;

  return (
    <nav className="flex w-48 shrink-0 flex-col gap-0.5" aria-label="Settings">
      <p className="text-muted px-3 pb-2 text-xs font-semibold tracking-wider uppercase">
        Settings
      </p>
      {TABS.map(({ href, labelKey, Icon }) => {
        const full = `${base}/${href}`;
        const active = pathname === full;
        return (
          <Link
            key={href}
            href={full}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              active ? "bg-brand/10 text-brand font-medium" : "text-muted hover:bg-surface-hover"
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
