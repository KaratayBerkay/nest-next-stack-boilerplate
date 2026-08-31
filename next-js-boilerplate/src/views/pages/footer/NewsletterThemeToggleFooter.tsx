"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/hooks/useTheme";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

export function NewsletterThemeToggleFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center lg:px-8">
        <h3 className="text-fg text-2xl font-semibold tracking-tight">
          {f.footer29Heading}
        </h3>
        <form className="flex w-full max-w-sm gap-2">
          <Input
            type="email"
            placeholder={f.footer29Placeholder}
            className="flex-1"
          />
          <Button type="submit" variant="primary" className="shrink-0">
            {f.footer29Submit}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="border-border bg-bg text-muted hover:text-fg mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
        >
          {isDark ? (
            <IconSun size={14} aria-hidden="true" />
          ) : (
            <IconMoon size={14} aria-hidden="true" />
          )}
          {isDark ? f.footer29LightModeLabel : f.footer29DarkModeLabel}
        </button>
        <span className="text-muted text-xs">{f.footer29Copyright}</span>
      </div>
    </footer>
  );
}
