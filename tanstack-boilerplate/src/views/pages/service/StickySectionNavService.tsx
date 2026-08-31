"use client";

import { useEffect, useRef, useState } from "react";
import { IconCompass } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServiceMessages } from "@/types/pages/service/ServiceMessages-types";

const SECTIONS = [
  {
    id: "service6-overview",
    navLabelKey: "service6Section1NavLabel",
    headingKey: "service6Section1Heading",
    bodyKey: "service6Section1Body",
  },
  {
    id: "service6-approach",
    navLabelKey: "service6Section2NavLabel",
    headingKey: "service6Section2Heading",
    bodyKey: "service6Section2Body",
  },
  {
    id: "service6-deliverables",
    navLabelKey: "service6Section3NavLabel",
    headingKey: "service6Section3Heading",
    bodyKey: "service6Section3Body",
  },
  {
    id: "service6-pricing",
    navLabelKey: "service6Section4NavLabel",
    headingKey: "service6Section4Heading",
    bodyKey: "service6Section4Body",
  },
] as const;

export function StickySectionNavService() {
  const t = useMessages("pages") as unknown as PagesWithServiceMessages;
  const s = t.service;

  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const elements = SECTIONS.map((section) =>
      sectionRefs.current.get(section.id),
    ).filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((closest, entry) =>
          entry.boundingClientRect.top < closest.boundingClientRect.top
            ? entry
            : closest,
        );
        setActiveId(topMost.target.id);
      },
      { rootMargin: "-88px 0px -60% 0px", threshold: [0, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setActiveId(id);
    sectionRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center lg:px-8">
        <Badge variant="soft" size="sm" className="w-fit">
          <IconCompass size={14} className="mr-1.5" aria-hidden="true" />
          {s.service6Eyebrow}
        </Badge>
        <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {s.service6Heading}
        </h1>
      </div>

      <nav
        aria-label={s.service6NavLabel}
        className="border-border bg-bg/95 sticky top-0 z-10 mt-10 border-y backdrop-blur"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-1 overflow-x-auto px-6 py-2.5 lg:px-8">
          {SECTIONS.map((section) => {
            const isActive = activeId === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleNavClick(section.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-md px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
                  isActive ? "bg-brand text-brand-fg" : "text-muted hover:text-fg hover:bg-surface-hover",
                )}
              >
                {s[section.navLabelKey]}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto flex max-w-3xl flex-col gap-14 px-6 py-14 lg:px-8">
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            id={section.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.id, el);
              else sectionRefs.current.delete(section.id);
            }}
            className="flex scroll-mt-28 flex-col gap-3 text-center"
          >
            <h2 className="text-fg text-2xl font-semibold tracking-tight">
              {s[section.headingKey]}
            </h2>
            <p className="text-muted leading-relaxed">{s[section.bodyKey]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
