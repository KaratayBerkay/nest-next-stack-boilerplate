"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChangelogMessages } from "@/types/pages/changelog/ChangelogMessages-types";

type ChangeType = "added" | "improved" | "fixed";

interface ChangelogChange {
  type: ChangeType;
  typeLabelKey: string;
  textKey: string;
}

interface ChangelogEntry {
  id: string;
  versionKey: string;
  dateKey: string;
  titleKey: string;
  descriptionKey: string;
  changes: ChangelogChange[];
}

const ENTRIES: ChangelogEntry[] = [
  {
    id: "changelog1-v240",
    versionKey: "changelog1Entry1Version",
    dateKey: "changelog1Entry1Date",
    titleKey: "changelog1Entry1Title",
    descriptionKey: "changelog1Entry1Description",
    changes: [
      {
        type: "added",
        typeLabelKey: "changelog1TypeAdded",
        textKey: "changelog1Entry1Change1Text",
      },
      {
        type: "improved",
        typeLabelKey: "changelog1TypeImproved",
        textKey: "changelog1Entry1Change2Text",
      },
      {
        type: "fixed",
        typeLabelKey: "changelog1TypeFixed",
        textKey: "changelog1Entry1Change3Text",
      },
    ],
  },
  {
    id: "changelog1-v230",
    versionKey: "changelog1Entry2Version",
    dateKey: "changelog1Entry2Date",
    titleKey: "changelog1Entry2Title",
    descriptionKey: "changelog1Entry2Description",
    changes: [
      {
        type: "added",
        typeLabelKey: "changelog1TypeAdded",
        textKey: "changelog1Entry2Change1Text",
      },
      {
        type: "improved",
        typeLabelKey: "changelog1TypeImproved",
        textKey: "changelog1Entry2Change2Text",
      },
      {
        type: "fixed",
        typeLabelKey: "changelog1TypeFixed",
        textKey: "changelog1Entry2Change3Text",
      },
    ],
  },
  {
    id: "changelog1-v221",
    versionKey: "changelog1Entry3Version",
    dateKey: "changelog1Entry3Date",
    titleKey: "changelog1Entry3Title",
    descriptionKey: "changelog1Entry3Description",
    changes: [
      {
        type: "fixed",
        typeLabelKey: "changelog1TypeFixed",
        textKey: "changelog1Entry3Change1Text",
      },
      {
        type: "improved",
        typeLabelKey: "changelog1TypeImproved",
        textKey: "changelog1Entry3Change2Text",
      },
      {
        type: "fixed",
        typeLabelKey: "changelog1TypeFixed",
        textKey: "changelog1Entry3Change3Text",
      },
    ],
  },
  {
    id: "changelog1-v220",
    versionKey: "changelog1Entry4Version",
    dateKey: "changelog1Entry4Date",
    titleKey: "changelog1Entry4Title",
    descriptionKey: "changelog1Entry4Description",
    changes: [
      {
        type: "added",
        typeLabelKey: "changelog1TypeAdded",
        textKey: "changelog1Entry4Change1Text",
      },
      {
        type: "added",
        typeLabelKey: "changelog1TypeAdded",
        textKey: "changelog1Entry4Change2Text",
      },
      {
        type: "improved",
        typeLabelKey: "changelog1TypeImproved",
        textKey: "changelog1Entry4Change3Text",
      },
    ],
  },
];

const TYPE_DOT_CLASS: Record<ChangeType, string> = {
  added: "bg-success",
  improved: "bg-info",
  fixed: "bg-warning",
};

function handleIntersect(
  observed: IntersectionObserverEntry[],
  setActive: Dispatch<SetStateAction<string>>,
) {
  for (const entry of observed) {
    if (entry.isIntersecting) {
      setActive(entry.target.id);
    }
  }
}

function handleRailClick(
  id: string,
  setActive: Dispatch<SetStateAction<string>>,
) {
  setActive(id);
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function StickyRailChangelog() {
  const t = useMessages("pages") as unknown as PagesWithChangelogMessages;
  const c = t.changelog;
  const [activeId, setActiveId] = useState(ENTRIES[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => handleIntersect(observed, setActiveId),
      { rootMargin: "-15% 0px -70% 0px" },
    );
    for (const entry of ENTRIES) {
      const node = document.getElementById(entry.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[220px_1fr] lg:gap-16 lg:px-8">
        <nav
          aria-label={c.changelog1Heading}
          className="border-border flex flex-col gap-1 lg:sticky lg:top-24 lg:self-start lg:border-r lg:pr-6"
        >
          {ENTRIES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleRailClick(entry.id, setActiveId)}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                activeId === entry.id
                  ? "bg-surface-hover text-fg font-medium"
                  : "text-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              <span className="block">{c[entry.versionKey]}</span>
              <span className="block text-xs opacity-70">
                {c[entry.dateKey]}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-2">
            <h2 className="text-fg text-3xl font-medium tracking-tight lg:text-4xl">
              {c.changelog1Heading}
            </h2>
            <p className="text-muted">{c.changelog1Intro}</p>
          </div>

          {ENTRIES.map((entry) => (
            <article
              key={entry.id}
              id={entry.id}
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">{c[entry.versionKey]}</Badge>
                <span className="text-muted text-sm">{c[entry.dateKey]}</span>
              </div>
              <h3 className="text-fg text-xl font-semibold tracking-tight">
                {c[entry.titleKey]}
              </h3>
              <p className="text-muted">{c[entry.descriptionKey]}</p>
              <ul className="flex flex-col gap-2.5">
                {entry.changes.map((change, index) => (
                  <li
                    key={`${entry.id}-${index}`}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        TYPE_DOT_CLASS[change.type],
                      )}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="text-fg font-medium">
                        {c[change.typeLabelKey]}
                      </span>{" "}
                      <span className="text-muted">{c[change.textKey]}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
