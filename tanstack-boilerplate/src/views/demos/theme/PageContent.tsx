"use client";

import { useTheme, THEMES } from "@/hooks/useTheme";

export default function ThemePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">Theme</h2>

      <section className="flex flex-col gap-3">
        <p className="text-muted text-sm">
          Current theme:{" "}
          <span className="font-semibold" data-testid="current-theme">
            {theme}
          </span>
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        {THEMES.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            data-testid={`set-${t.name}`}
            className="border-border text-fg hover:bg-surface-hover rounded border px-4 py-2 text-sm font-medium"
          >
            {t.label}
          </button>
        ))}
      </section>

      <section className="flex flex-wrap gap-3">
        <div className="bg-bg text-fg rounded p-4 text-sm shadow-sm">
          Surface card
        </div>
        <div className="bg-surface text-fg rounded p-4 text-sm shadow-sm">
          Surface card
        </div>
        <div className="bg-fg text-bg rounded p-4 text-sm shadow-sm">
          Inverted card
        </div>
      </section>
    </div>
  );
}
