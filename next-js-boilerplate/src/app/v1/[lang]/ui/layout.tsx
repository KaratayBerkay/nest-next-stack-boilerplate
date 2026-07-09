"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import type { UILayoutProps } from "@/types/ui/UILayout-types";

export default function UILayout({ children }: UILayoutProps) {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const scrollRef = useYSwipeGesture<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      className="flex w-full min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
    >
      <div className="border-border bg-bg/80 sticky top-0 z-50 -mx-4 mb-4 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm @sm:-mx-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/v1/${lang}/ui`}
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
            Back
          </Link>
          <span className="text-muted mx-1 text-xs">/</span>
          <span className="text-sm font-semibold">UI Components</span>
          <span className="text-muted hidden text-xs md:inline">
            /v1/:lang/ui/:component
          </span>
        </div>
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-4 pb-6">{children}</div>
    </div>
  );
}
