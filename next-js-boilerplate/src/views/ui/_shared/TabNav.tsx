"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface TabNavItem {
  id: string;
  title: string;
}

export function TabNav({
  items,
  basePath,
}: {
  items: TabNavItem[];
  basePath: string;
}) {
  const pathname = usePathname();
  const [accordionOpen, setAccordionOpen] = useState(false);

  const activeId =
    items.find((item) => {
      if (!item.id) return pathname === basePath;
      return pathname.endsWith(`/${item.id}`);
    })?.id ?? items[0]?.id;

  return (
    <>
      <div className="bg-surface hidden w-full gap-0.5 rounded-lg p-0.5 md:flex">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <Link
              key={item.id || "root"}
              href={item.id ? `${basePath}/${item.id}` : basePath}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-all",
                isActive
                  ? "bg-surface-hover text-fg ring-border shadow-sm ring-1"
                  : "text-muted hover:bg-surface-hover/50 hover:text-fg",
              )}
            >
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setAccordionOpen(!accordionOpen)}
          className={cn(
            "border-border flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
            accordionOpen
              ? "bg-surface-hover text-fg"
              : "bg-surface text-muted hover:bg-surface-hover hover:text-fg",
          )}
        >
          {items.find((i) => i.id === activeId)?.title ?? "Select tab"}
          <svg
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              accordionOpen && "rotate-180",
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {accordionOpen && (
          <div className="border-border bg-surface mt-1 flex flex-col gap-1 rounded-lg border p-1">
            {items.map((item) => {
              const isActive = item.id === activeId;
              return (
                <Link
                  key={item.id || "root"}
                  href={item.id ? `${basePath}/${item.id}` : basePath}
                  onClick={() => setAccordionOpen(false)}
                  className={cn(
                    "rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface-hover text-fg"
                      : "text-muted hover:bg-surface-hover/50 hover:text-fg",
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
