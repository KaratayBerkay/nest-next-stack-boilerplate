"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FIND_FRIENDS_PATH } from "@/constants/routes";
import {
  IconHome,
  IconUsers,
  IconMessage,
  IconMail,
  IconUserPlus,
  IconComponents,
  IconAlertTriangle,
  IconQuestionMark,
  IconRss,
  IconShare,
  IconSettings,
  IconShield,
} from "@tabler/icons-react";

const AUTH_REQUIRED_HREFS = [
  "/feed",
  "/share",
  "/chat-room",
  "/messages",
  FIND_FRIENDS_PATH,
];

export function V1Nav({ onNav }: { onNav?: () => void }) {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "";
  const pathname = usePathname();
  const { user } = useAuth();
  const base = `/v1/${lang}`;
  const t = useMessages("v1-shell");

  const links = [
    { href: "", label: t.navHome, Icon: IconHome },
    { href: "/feed", label: "Feed", Icon: IconRss, auth: true },
    { href: "/share", label: "Share", Icon: IconShare, auth: true },
    { href: "/users/list", label: t.navUsers, Icon: IconUsers },
    { href: "/chat-room", label: t.navChatRoom, Icon: IconMessage },
    { href: "/messages", label: t.navMessages, Icon: IconMail },
    { href: FIND_FRIENDS_PATH, label: t.navFindFriends, Icon: IconUserPlus },
    { href: "/premium", label: "Premium", Icon: IconShield, auth: true },
    {
      href: "/settings/sessions",
      label: "Sessions",
      Icon: IconSettings,
      auth: true,
    },
    { href: "/ui", label: t.navUiComponents, Icon: IconComponents },
    { href: "/boom", label: t.navErrorTest, Icon: IconAlertTriangle },
    { href: "/missing", label: t.navNotFound, Icon: IconQuestionMark },
  ];

  const isAdmin =
    user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  if (isAdmin) {
    links.push({
      href: "/admin",
      label: "Admin",
      Icon: IconShield,
      auth: true,
    });
  }

  return (
    <nav className="flex flex-col gap-0.5" aria-label="v1">
      {links.map(({ href, label, Icon }) => {
        const full = `${base}${href}`;
        const active = pathname === full;
        if (AUTH_REQUIRED_HREFS.includes(href) && !user) return null;

        return (
          <Link
            key={href}
            href={full}
            onClick={onNav}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-brand/10 text-brand font-medium"
                : "text-muted hover:bg-surface-hover"
            }`}
          >
            <Icon size={18} stroke={1.5} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
