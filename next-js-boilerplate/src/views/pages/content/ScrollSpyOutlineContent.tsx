"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContentMessages } from "@/types/pages/content/ContentMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const HERO_SEED = "content1-hero";

const SECTIONS = [
  {
    id: "content1-restraint",
    navLabelKey: "content1Section1NavLabel",
    headingKey: "content1Section1Heading",
    paragraphKey: "content1Section1Paragraph",
  },
  {
    id: "content1-typography",
    navLabelKey: "content1Section2NavLabel",
    headingKey: "content1Section2Heading",
    paragraphKey: "content1Section2Paragraph",
  },
  {
    id: "content1-motion",
    navLabelKey: "content1Section3NavLabel",
    headingKey: "content1Section3Heading",
    paragraphKey: "content1Section3Paragraph",
  },
  {
    id: "content1-edges",
    navLabelKey: "content1Section4NavLabel",
    headingKey: "content1Section4Heading",
    paragraphKey: "content1Section4Paragraph",
  },
] as const;

export function ScrollSpyOutlineContent() {
  const t = useMessages("pages") as unknown as PagesWithContentMessages;
  const c = t.content;

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
      { rootMargin: "-96px 0px -55% 0px", threshold: [0, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setActiveId(id);
    sectionRefs.current
      .get(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-8">
        <div className="flex flex-col gap-4">
          <Badge variant="soft" size="sm" className="w-fit">
            {c.content1Eyebrow}
          </Badge>
          <Typography
            variant="h2"
            className="max-w-3xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {c.content1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {c.content1Subtext}
          </Typography>
          <div className="text-muted flex items-center gap-2 text-sm">
            <span>{c.content1Date}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{c.content1ReadTime}</span>
          </div>
        </div>

        <AspectRatio
          ratio={16 / 9}
          className="bg-surface relative overflow-hidden rounded-3xl"
        >
          <Image
            src={placeholderImage(HERO_SEED, "16x9")}
            alt={c.content1HeroAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </AspectRatio>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px]">
          <article className="flex min-w-0 flex-col gap-12">
            {SECTIONS.map((section) => (
              <div
                key={section.id}
                id={section.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(section.id, el);
                  else sectionRefs.current.delete(section.id);
                }}
                className="flex scroll-mt-28 flex-col gap-3"
              >
                <Typography
                  variant="h3"
                  className="text-2xl font-medium tracking-tighter"
                >
                  {c[section.headingKey]}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {c[section.paragraphKey]}
                </Typography>
              </div>
            ))}
          </article>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <p className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
              {c.content1OutlineLabel}
            </p>
            <nav
              aria-label={c.content1OutlineLabel}
              className="border-border flex flex-col gap-1 border-l-2 pl-4"
            >
              {SECTIONS.map((section) => {
                const isActive = activeId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleNavClick(section.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "focus-visible:ring-brand -ml-4 border-l-2 py-1 pl-3.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                      isActive
                        ? "border-brand text-fg font-medium"
                        : "text-muted hover:text-fg border-transparent",
                    )}
                  >
                    {c[section.navLabelKey]}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      </div>
    </section>
  );
}
