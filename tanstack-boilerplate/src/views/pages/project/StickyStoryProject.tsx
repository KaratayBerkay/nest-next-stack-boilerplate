"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectMessages } from "@/types/pages/project/ProjectMessages-types";

interface StorySection {
  id: string;
  labelKey: string;
  headingKey: string;
  bodyKey: string;
}

const SECTIONS: StorySection[] = [
  {
    id: "discovery",
    labelKey: "project4Section1Label",
    headingKey: "project4Section1Heading",
    bodyKey: "project4Section1Body",
  },
  {
    id: "design",
    labelKey: "project4Section2Label",
    headingKey: "project4Section2Heading",
    bodyKey: "project4Section2Body",
  },
  {
    id: "build",
    labelKey: "project4Section3Label",
    headingKey: "project4Section3Heading",
    bodyKey: "project4Section3Body",
  },
  {
    id: "launch",
    labelKey: "project4Section4Label",
    headingKey: "project4Section4Heading",
    bodyKey: "project4Section4Body",
  },
];

export function StickyStoryProject() {
  const t = useMessages("pages") as unknown as PagesWithProjectMessages;
  const p = t.project;
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map((section) => sectionRefs.current[section.id]).filter(
      (el): el is HTMLDivElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) {
          const id = visible.target.dataset.sectionId;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activeIndex = SECTIONS.findIndex((section) => section.id === activeId);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-b border-border pb-10">
          <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.project4Title}
          </h1>
          <p className="text-muted max-w-2xl text-lg leading-relaxed">
            {p.project4Subtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-muted text-xs">
                  {p.project4ClientLabel}
                </span>
                <span className="text-fg text-sm font-medium">
                  {p.project4ClientValue}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted text-xs">
                  {p.project4RoleLabel}
                </span>
                <span className="text-fg text-sm font-medium">
                  {p.project4RoleValue}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted text-xs">
                  {p.project4TimelineLabel}
                </span>
                <span className="text-fg text-sm font-medium">
                  {p.project4TimelineValue}
                </span>
              </div>

              <nav aria-label={p.project4ProgressAriaLabel}>
                <ol className="border-border flex flex-col gap-3 border-l pl-4">
                  {SECTIONS.map((section, index) => (
                    <li key={section.id}>
                      <span
                        className={
                          index <= activeIndex
                            ? "text-fg text-sm font-medium"
                            : "text-muted text-sm"
                        }
                      >
                        {p[section.labelKey]}
                      </span>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>

          <div className="flex flex-col gap-16">
            {SECTIONS.map((section) => (
              <div
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                data-section-id={section.id}
                className="flex flex-col gap-4"
              >
                <Badge variant="outline" className="w-fit lg:hidden">
                  {p[section.labelKey]}
                </Badge>
                <h2 className="text-fg text-2xl font-semibold">
                  {p[section.headingKey]}
                </h2>
                <p className="text-muted leading-relaxed">
                  {p[section.bodyKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
