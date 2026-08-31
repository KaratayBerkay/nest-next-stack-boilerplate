"use client";

import {
  IconAccessible,
  IconCursorText,
  IconHandStop,
  IconKeyboard,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const SHORTCUTS = [
  {
    kbdKey: "feature217aKbd1Key",
    labelKey: "feature217aKbd1Label",
    icon: IconKeyboard,
  },
  {
    kbdKey: "feature217aKbd2Key",
    labelKey: "feature217aKbd2Label",
    icon: IconCursorText,
  },
  {
    kbdKey: "feature217aKbd3Key",
    labelKey: "feature217aKbd3Label",
    icon: IconHandStop,
  },
  {
    kbdKey: "feature217aKbd4Key",
    labelKey: "feature217aKbd4Label",
    icon: IconSearch,
  },
] as const;

export function AccessibilityHeroFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <span className="bg-brand/10 text-brand inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <IconAccessible size={16} aria-hidden="true" />
            {f.feature217aPill}
          </span>
          <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {f.feature217aHeading}
          </h2>
          <p className="text-fg max-w-2xl text-lg leading-relaxed lg:text-xl">
            {f.feature217aIntro}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="primary">
              <a href={LINK_URL}>{f.feature217aPrimaryAction}</a>
            </Button>
            <Button asChild variant="outline">
              <a href={LINK_URL}>{f.feature217aSecondaryAction}</a>
            </Button>
          </div>
          <div className="border-border mt-2 flex w-full flex-wrap gap-x-8 gap-y-4 border-t pt-8">
            {SHORTCUTS.map((shortcut) => (
              <span key={shortcut.kbdKey} className="flex items-center gap-3">
                <kbd className="border-border bg-surface text-fg inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold shadow-sm">
                  <shortcut.icon
                    size={15}
                    className="text-brand"
                    aria-hidden="true"
                  />
                  {f[shortcut.kbdKey]}
                </kbd>
                <span className="text-muted text-sm">
                  {f[shortcut.labelKey]}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
