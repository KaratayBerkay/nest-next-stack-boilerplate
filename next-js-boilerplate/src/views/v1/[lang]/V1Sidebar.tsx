"use client";

import { forwardRef } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
import { LOGIN_PATH } from "@/constants/routes";
import { V1Nav } from "./V1Nav";
import { ProfileSection } from "./ProfileSection";
import type { V1SidebarProps } from "@/types/v1/V1Sidebar-types";

export const V1Sidebar = forwardRef<HTMLElement, V1SidebarProps>(
  function V1Sidebar({ sidebarOpen, user, logout, lang, onNav }, ref) {
    const t = useMessages("v1-shell");

    return (
      <aside
        ref={ref}
        className={cn(
          "bg-bg border-border flex-col overflow-hidden border-r shadow-lg transition-all duration-300 ease-out motion-reduce:transition-none",
          "fixed top-14 left-0 z-50 h-[calc(100dvh-3.5rem)] w-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-auto md:flex md:h-auto md:translate-x-0",
          sidebarOpen
            ? "md:w-56 md:border-r md:opacity-100 md:shadow-lg"
            : "md:w-0 md:overflow-hidden md:border-r-0 md:p-0 md:opacity-0 md:shadow-none",
        )}
      >
        <div className="text-muted border-border flex items-center justify-center border-b px-3 py-2">
          <span className="text-[10px] font-medium tracking-wider uppercase opacity-60">
            {t.swipeLeftToClose}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <V1Nav onNav={onNav} />
        </div>

        {user ? (
          <div className="border-border border-t px-2 py-2">
            <ProfileSection user={user} logout={logout} lang={lang} />
          </div>
        ) : (
          <div className="border-border border-t px-4 py-3">
            <a
              href={LOGIN_PATH}
              className="bg-brand block rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white hover:opacity-90"
            >
              {t.signIn}
            </a>
          </div>
        )}
      </aside>
    );
  },
);
