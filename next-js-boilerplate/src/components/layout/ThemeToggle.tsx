"use client";

import { useRef, useState } from "react";
import { useTheme, THEMES, type ThemeName } from "@/hooks/useTheme";
import {
  IconSun,
  IconMoon,
  IconSparkles,
  IconGlass,
  IconBolt,
  IconFlame,
} from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { useClickOutside } from "@/hooks/useClickOutside";

const THEME_ICONS: Record<ThemeName, typeof IconSun> = {
  light: IconSun,
  dark: IconMoon,
  shiny: IconSparkles,
  glass: IconGlass,
  neon: IconBolt,
  gradient: IconFlame,
};

export function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const Icon = THEME_ICONS[theme];

  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <IconButton
        icon={<Icon size={20} />}
        label={`Theme: ${theme}. Click to switch.`}
        data-testid="theme-toggle"
        onClick={() => setOpen((p) => !p)}
      />
      {open && (
        <div className="bg-bg border-border absolute top-full right-0 mt-1 flex min-w-[180px] flex-col rounded-lg border p-1 shadow-sm">
          {THEMES.map((t) => {
            const ItemIcon = THEME_ICONS[t.name];
            const active = t.name === theme;
            return (
              <button
                key={t.name}
                onClick={() => {
                  setTheme(t.name);
                  setOpen(false);
                }}
                className={`hover:bg-surface-hover flex items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-medium ${
                  active ? "text-fg" : "text-muted"
                }`}
              >
                <ItemIcon size={16} stroke={1.5} />
                <span className="flex-1">{t.label}</span>
                {active && <span className="bg-brand h-2 w-2 rounded-full" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
