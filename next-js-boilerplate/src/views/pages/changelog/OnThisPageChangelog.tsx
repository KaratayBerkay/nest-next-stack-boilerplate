"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChangelogMessages } from "@/types/pages/changelog/ChangelogMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface ChangelogEntry {
  id: string;
  versionKey: string;
  dateKey: string;
  titleKey: string;
  bodyKey: string;
  tag1Key: string;
  tag2Key: string;
  seed: string;
}

const ENTRIES: ChangelogEntry[] = [
  {
    id: "changelog8-1",
    versionKey: "changelog8Entry1Version",
    dateKey: "changelog8Entry1Date",
    titleKey: "changelog8Entry1Title",
    bodyKey: "changelog8Entry1Body",
    tag1Key: "changelog8Entry1Tag1",
    tag2Key: "changelog8Entry1Tag2",
    seed: "changelog8-1",
  },
  {
    id: "changelog8-2",
    versionKey: "changelog8Entry2Version",
    dateKey: "changelog8Entry2Date",
    titleKey: "changelog8Entry2Title",
    bodyKey: "changelog8Entry2Body",
    tag1Key: "changelog8Entry2Tag1",
    tag2Key: "changelog8Entry2Tag2",
    seed: "changelog8-2",
  },
  {
    id: "changelog8-3",
    versionKey: "changelog8Entry3Version",
    dateKey: "changelog8Entry3Date",
    titleKey: "changelog8Entry3Title",
    bodyKey: "changelog8Entry3Body",
    tag1Key: "changelog8Entry3Tag1",
    tag2Key: "changelog8Entry3Tag2",
    seed: "changelog8-3",
  },
  {
    id: "changelog8-4",
    versionKey: "changelog8Entry4Version",
    dateKey: "changelog8Entry4Date",
    titleKey: "changelog8Entry4Title",
    bodyKey: "changelog8Entry4Body",
    tag1Key: "changelog8Entry4Tag1",
    tag2Key: "changelog8Entry4Tag2",
    seed: "changelog8-4",
  },
  {
    id: "changelog8-5",
    versionKey: "changelog8Entry5Version",
    dateKey: "changelog8Entry5Date",
    titleKey: "changelog8Entry5Title",
    bodyKey: "changelog8Entry5Body",
    tag1Key: "changelog8Entry5Tag1",
    tag2Key: "changelog8Entry5Tag2",
    seed: "changelog8-5",
  },
];

function handleIntersect(
  observed: IntersectionObserverEntry[],
  setActiveId: Dispatch<SetStateAction<string>>,
) {
  for (const entry of observed) {
    if (entry.isIntersecting) {
      setActiveId(entry.target.id);
      return;
    }
  }
}

function handleNavClick(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function OnThisPageChangelog() {
  const t = useMessages("pages") as unknown as PagesWithChangelogMessages;
  const c = t.changelog;
  const [activeId, setActiveId] = useState(ENTRIES[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => handleIntersect(observed, setActiveId),
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const entry of ENTRIES) {
      const node = document.getElementById(entry.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 lg:grid-cols-[1fr_200px] lg:px-8">
        <div className="flex min-w-0 flex-col gap-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-fg text-3xl font-medium tracking-tight lg:text-4xl">
              {c.changelog8Heading}
            </h2>
            <p className="text-muted">{c.changelog8Intro}</p>
          </div>

          {ENTRIES.map((entry) => (
            <article
              key={entry.id}
              id={entry.id}
              className="flex scroll-mt-24 flex-col gap-4 sm:flex-row"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={placeholderImage(entry.seed, "1x1")}
                  alt={c[entry.titleKey]}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-fg font-medium">
                    {c[entry.versionKey]}
                  </span>
                  <span className="text-muted" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-muted">{c[entry.dateKey]}</span>
                </div>
                <h3 className="text-fg text-xl font-semibold tracking-tight">
                  {c[entry.titleKey]}
                </h3>
                <p className="text-muted leading-relaxed">{c[entry.bodyKey]}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="soft" size="sm">
                    {c[entry.tag1Key]}
                  </Badge>
                  <Badge variant="soft" size="sm">
                    {c[entry.tag2Key]}
                  </Badge>
                </div>
              </div>
            </article>
          ))}
        </div>

        <nav
          aria-label={c.changelog8NavLabel}
          className="hidden lg:sticky lg:top-24 lg:flex lg:h-fit lg:flex-col lg:gap-3"
        >
          <span className="text-muted text-xs font-semibold tracking-wider uppercase">
            {c.changelog8NavLabel}
          </span>
          <ul className="flex flex-col gap-1">
            {ENTRIES.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(entry.id)}
                  className={cn(
                    "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                    activeId === entry.id
                      ? "text-brand font-medium"
                      : "text-muted hover:text-fg",
                  )}
                >
                  {c[entry.versionKey]}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
