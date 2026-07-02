"use client";

import { useRef, useState } from "react";
import { useTheme, THEMES, type ThemeName } from "@/hooks/useTheme";
import {
  IconSun,
  IconMoon,
  IconDroplet,
  IconPalette,
} from "@tabler/icons-react";
import { useClickOutside } from "@/hooks/useClickOutside";

const THEME_ICONS: Record<ThemeName, typeof IconSun> = {
  light: IconSun,
  dark: IconMoon,
  ocean: IconDroplet,
  violet: IconPalette,
};

const THEME_COLORS: Record<ThemeName, string> = {
  light: "bg-amber-400",
  dark: "bg-indigo-500",
  ocean: "bg-cyan-500",
  violet: "bg-violet-500",
};

export function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const Icon = THEME_ICONS[theme];

  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        data-testid="theme-toggle"
        className="text-muted hover:bg-surface-hover relative rounded-lg p-1.5"
        aria-label={`Theme: ${theme}. Click to switch.`}
      >
        <Icon size={20} stroke={1.5} />
      </button>
      {open && (
        <div className="bg-bg border-border absolute top-full right-0 mt-1 flex min-w-[140px] flex-col rounded-lg border p-1 shadow-sm">
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
                <span
                  className={`h-3 w-3 rounded-full ${THEME_COLORS[t.name]} ${
                    active ? "ring-fg ring-2 ring-offset-1" : ""
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
