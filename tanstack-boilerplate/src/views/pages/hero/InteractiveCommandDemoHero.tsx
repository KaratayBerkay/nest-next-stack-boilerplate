"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconTerminal2 } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

const COPY_RESET_MS = 2000;

interface PackageManagerTab {
  id: string;
  labelKey: string;
  command: string;
}

const TABS: PackageManagerTab[] = [
  { id: "npm", labelKey: "hero5TabNpm", command: "npm install @northline/client" },
  { id: "pnpm", labelKey: "hero5TabPnpm", command: "pnpm add @northline/client" },
  { id: "yarn", labelKey: "hero5TabYarn", command: "yarn add @northline/client" },
];

export function InteractiveCommandDemoHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;
  const [activeId, setActiveId] = useState(TABS[0].id);
  const [copied, setCopied] = useState(false);
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(active.command).catch(() => undefined);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_RESET_MS);
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-5">
          <span className="text-brand text-xs font-medium tracking-widest uppercase">
            {h.hero5Eyebrow}
          </span>
          <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {h.hero5Heading}
          </h1>
          <p className="text-muted max-w-md text-lg">{h.hero5Subheading}</p>
          <div className="mt-2">
            <Button variant="primary" size="lg">
              {h.hero5PrimaryCta}
            </Button>
          </div>
        </div>

        <div className="border-border bg-fg overflow-hidden rounded-2xl border shadow-lg">
          <div className="border-border/20 flex items-center justify-between gap-3 border-b px-4 py-3">
            <span className="text-bg/70 inline-flex items-center gap-2 text-xs font-medium">
              <IconTerminal2 size={14} aria-hidden="true" />
              {h.hero5TerminalTitle}
            </span>
            <div className="bg-bg/10 flex items-center gap-1 rounded-full p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveId(tab.id)}
                  data-state={activeId === tab.id ? "active" : "inactive"}
                  className="data-[state=active]:bg-bg data-[state=active]:text-fg data-[state=inactive]:text-bg/60 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                >
                  {h[tab.labelKey]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-5">
            <code className="text-bg/90 truncate font-mono text-sm">
              <span className="text-bg/40 select-none">$ </span>
              {active.command}
            </code>
            <IconButton
              icon={
                copied ? (
                  <IconCheck size={15} className="text-success" />
                ) : (
                  <IconCopy size={15} className="text-bg/70" />
                )
              }
              label={copied ? h.hero5CopiedLabel : h.hero5CopyAria}
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
