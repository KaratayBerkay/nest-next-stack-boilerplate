"use client";

import { useRef, useState } from "react";
import { Progress } from "@/components/ui/Progress";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

interface SectionEntry {
  id: string;
  titleKey: string;
  bodyKey: string;
}

const SECTIONS: SectionEntry[] = [
  {
    id: "introduction",
    titleKey: "sidebar8Section1Title",
    bodyKey: "sidebar8Section1Body",
  },
  {
    id: "installation",
    titleKey: "sidebar8Section2Title",
    bodyKey: "sidebar8Section2Body",
  },
  {
    id: "configuration",
    titleKey: "sidebar8Section3Title",
    bodyKey: "sidebar8Section3Body",
  },
  {
    id: "deployment",
    titleKey: "sidebar8Section4Title",
    bodyKey: "sidebar8Section4Body",
  },
];

export function DocsTocScrollSidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollableHeight = container.scrollHeight - container.clientHeight;
    setProgress(
      scrollableHeight > 0
        ? Math.min(
            100,
            Math.round((container.scrollTop / scrollableHeight) * 100),
          )
        : 0,
    );

    let current = SECTIONS[0].id;
    for (const section of SECTIONS) {
      const el = sectionRefs.current.get(section.id);
      if (
        el &&
        el.offsetTop - container.offsetTop <= container.scrollTop + 24
      ) {
        current = section.id;
      }
    }
    setActiveId(current);
  };

  const handleTocClick = (id: string) => {
    const container = containerRef.current;
    const el = sectionRefs.current.get(id);
    if (!container || !el) return;
    container.scrollTo({
      top: el.offsetTop - container.offsetTop,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[560px] w-full overflow-hidden rounded-2xl border">
          <aside className="border-border bg-surface flex w-60 shrink-0 flex-col border-r p-4">
            <p className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
              {sb.sidebar8TocLabel}
            </p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((section) => {
                const isActive = section.id === activeId;
                return (
                  <button
                    key={section.id}
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => handleTocClick(section.id)}
                    className={cn(
                      "border-border rounded-lg border-l-2 px-3 py-1.5 text-left text-sm transition-colors",
                      isActive
                        ? "border-l-brand text-fg font-medium"
                        : "text-muted hover:text-fg border-l-transparent",
                    )}
                  >
                    {sb[section.titleKey]}
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto flex flex-col gap-1 pt-4">
              <span className="text-muted text-xs">
                {sb.sidebar8ProgressLabel}
              </span>
              <Progress
                value={progress}
                size="sm"
                aria-label={sb.sidebar8ProgressLabel}
              />
            </div>
          </aside>

          <main
            ref={containerRef}
            onScroll={handleScroll}
            className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8"
          >
            <div className="flex max-w-xl flex-col gap-10">
              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  ref={(el) => {
                    if (el) sectionRefs.current.set(section.id, el);
                  }}
                >
                  <Typography
                    variant="h3"
                    className="text-xl font-medium tracking-tight"
                  >
                    {sb[section.titleKey]}
                  </Typography>
                  <Typography variant="body" className="text-muted mt-2">
                    {sb[section.bodyKey]}
                  </Typography>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
