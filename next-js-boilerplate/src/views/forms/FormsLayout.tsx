"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { FormsLayoutProps } from "@/types/forms/FormsLayout-types";

export default function FormsLayout({ children }: FormsLayoutProps) {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const pathname = usePathname();
  const scrollRef = useYSwipeGesture<HTMLDivElement>();
  const t = useMessages("forms");

  const isSubPage = pathname.split("/").filter(Boolean).length > 3;

  return (
    <div
      ref={scrollRef}
      className="scroll-fade-y flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto"
    >
      <div className="border-border bg-bg/80 sticky top-0 z-50 -mx-4 mb-4 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm @sm:-mx-5">
        <div className="flex items-center gap-3">
          {isSubPage && (
            <Link
              href={`/v1/${lang}/forms`}
              className="text-muted hover:text-fg -ml-1 flex items-center gap-1 rounded px-1 py-0.5 text-xs transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              {t.gallery.back}
            </Link>
          )}
          <span className="text-muted mx-1 text-xs">/</span>
          <span className="text-sm font-semibold">
            {t.gallery.breadcrumbLabel}
          </span>
          <span className="text-muted hidden text-xs md:inline">
            /v1/:lang/forms/:example
          </span>
        </div>
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-4 pb-6">{children}</div>
    </div>
  );
}
