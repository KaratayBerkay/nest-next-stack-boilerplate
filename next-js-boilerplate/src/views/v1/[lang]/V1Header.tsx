"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import { IconMenu2 } from "@tabler/icons-react";
import { NotificationDropdown } from "@/components/feed/NotificationDropdown";
import { MessageDropdown } from "./MessageDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { LOGIN_PATH } from "@/constants/routes";
import type { V1HeaderProps } from "@/types/v1/V1Header-types";

export function V1Header({
  toggle,
  open,
  loading,
  user,
  logout,
  lang,
  conversations,
}: V1HeaderProps) {
  const t = useMessages("v1-shell");

  return (
    <header className="border-border bg-bg z-50 flex h-14 shrink-0 items-center border-b">
      <button
        onClick={toggle}
        className="text-muted hover:bg-surface-hover ml-3 rounded-lg p-1.5"
        aria-label={t.toggleSidebar}
      >
        <IconMenu2 size={20} />
      </button>

      <button onClick={open} className="flex h-full items-center gap-2 px-4">
        <div className="bg-brand flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white">
          V
        </div>
        <span className="text-sm font-semibold">{t.brand}</span>
      </button>

      <div className="flex flex-1 items-center gap-3 px-4 md:px-6">
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <LangSwitcher />
          <ThemeToggle />
          {loading ? (
            <span className="text-muted text-xs">{t.authLoading}</span>
          ) : user ? (
            <>
              <MessageDropdown conversations={conversations} lang={lang} />
              <NotificationDropdown lang={lang} />
              <ProfileDropdown
                user={user}
                logout={logout}
                lang={lang}
                align="right"
              >
                <Avatar
                  src={user.avatarUrl}
                  fallback={initials(user.name || user.email)}
                  className="bg-brand ring-border h-8 w-8 shrink-0 text-[11px] text-white ring-2"
                />
              </ProfileDropdown>
            </>
          ) : (
            <a
              href={LOGIN_PATH}
              className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              {t.signIn}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
