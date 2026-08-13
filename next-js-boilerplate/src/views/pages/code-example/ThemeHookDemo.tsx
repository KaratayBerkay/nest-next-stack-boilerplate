"use client";

import { useState } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { CodeBlock } from "@/views/ui/_shared/CodeBlock";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";

const USE_THEME_CODE = `import { useState, useEffect } from 'react';

const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return { theme, toggleTheme };
};`;

const THEME_TOGGLE_CODE = `import { useTheme } from './useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">
        Current theme: {theme}
      </span>

      <button
        onClick={toggleTheme}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
      >
        Switch to {theme === 'light' ? 'Dark' : 'Light'}
      </button>

      <div
        className={
          theme === 'light'
            ? 'size-8 rounded-full border-2 border-gray-300 bg-yellow-400'
            : 'size-8 rounded-full border-2 border-gray-600 bg-gray-800'
        }
      />
    </div>
  );
};`;

export function ThemeHookDemo() {
  const t = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = t.codeExample;
  const [demoTheme, setDemoTheme] = useState<"light" | "dark">("light");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid gap-20">
          <div className="grid place-items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-4 lg:pr-10">
              <span className="text-muted mb-6 text-xs font-medium tracking-widest uppercase">
                {co["codeExample3HooksTag"]}
              </span>
              <h2 className="text-fg text-4xl font-semibold tracking-tight">
                {co["codeExample3HooksHeading"]}
              </h2>
              <p className="text-muted text-lg">
                {co["codeExample3HooksDescription"]}
              </p>
              <Button
                variant="outline"
                className="mt-4 w-fit"
                rightIcon={<IconArrowRight className="h-4 w-4" />}
              >
                {co["codeExample3LearnMoreButton"]}
              </Button>
            </div>
            <div className="flex w-full flex-col gap-1 overflow-hidden">
              <div className="border-border bg-surface flex items-center rounded-t-xl border border-b-0 px-4 py-2">
                <span className="text-muted font-mono text-xs">
                  use-theme.ts
                </span>
              </div>
              <CodeBlock code={USE_THEME_CODE} className="rounded-t-none" />
            </div>
          </div>
          <div className="grid place-items-center gap-10 lg:grid-cols-2">
            <div className="flex w-full flex-col gap-4 lg:order-none lg:pr-10">
              <div className="bg-surface border-border flex items-center justify-between gap-4 rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`size-6 rounded-full border-2 ${
                      demoTheme === "light"
                        ? "border-border bg-brand"
                        : "border-border bg-surface-hover"
                    }`}
                  />
                  <span className="text-fg text-sm font-medium">
                    {co["codeExample3CurrentThemeLabel"]} {demoTheme}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setDemoTheme(demoTheme === "light" ? "dark" : "light")
                  }
                >
                  {demoTheme === "light"
                    ? co["codeExample3SwitchToDarkButton"]
                    : co["codeExample3SwitchToLightButton"]}
                </Button>
              </div>
              <div className="flex w-full flex-col gap-1 overflow-hidden">
                <div className="border-border bg-surface flex items-center rounded-t-xl border border-b-0 px-4 py-2">
                  <span className="text-muted font-mono text-xs">
                    theme-toggle.tsx
                  </span>
                </div>
                <CodeBlock
                  code={THEME_TOGGLE_CODE}
                  className="rounded-t-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 lg:pl-10">
              <span className="text-muted mb-6 text-xs font-medium tracking-widest uppercase">
                {co["codeExample3ImplementationTag"]}
              </span>
              <h2 className="text-fg text-4xl font-semibold tracking-tight">
                {co["codeExample3ImplementationHeading"]}
              </h2>
              <p className="text-muted text-lg">
                {co["codeExample3ImplementationDescription"]}
              </p>
              <Button
                variant="outline"
                className="mt-4 w-fit"
                rightIcon={<IconArrowRight className="h-4 w-4" />}
              >
                {co["codeExample3LearnMoreButton"]}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
