"use client";

import { useTheme } from "@/hooks/useTheme";

function ThemeContent() {
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
        <p className="text-muted text-sm">
          Toggle with the button in the header above, or use the explicit
          buttons below.
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          onClick={() => setTheme("light")}
          data-testid="set-light"
          className="border-border text-fg hover:bg-surface-hover rounded border px-4 py-2 text-sm font-medium"
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          data-testid="set-dark"
          className="border-border text-fg hover:bg-surface-hover rounded border px-4 py-2 text-sm font-medium"
        >
          Dark
        </button>
        <button
          onClick={() => setTheme("ocean")}
          data-testid="set-ocean"
          className="border-border text-fg hover:bg-surface-hover rounded border px-4 py-2 text-sm font-medium"
        >
          Ocean
        </button>
        <button
          onClick={() => setTheme("violet")}
          data-testid="set-violet"
          className="border-border text-fg theme-violet hover:bg-surface-hover rounded border px-4 py-2 text-sm font-medium"
        >
          Violet
        </button>
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

export default function ThemePage() {
  return <ThemeContent />;
}
