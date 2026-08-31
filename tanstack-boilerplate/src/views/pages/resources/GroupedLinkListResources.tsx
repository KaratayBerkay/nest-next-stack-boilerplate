"use client";

import Link from "next/link";
import type { Icon } from "@tabler/icons-react";
import {
  IconArrowUpRight,
  IconBriefcase,
  IconFileText,
  IconUsers,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithResourcesMessages } from "@/types/pages/resources/ResourcesMessages-types";

const LINK_URL = "#" as const;

interface GroupItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
}

interface LinkGroup {
  id: string;
  headingKey: string;
  icon: Icon;
  items: GroupItem[];
}

const GROUPS: LinkGroup[] = [
  {
    id: "documentation",
    headingKey: "resources4Group1Heading",
    icon: IconFileText,
    items: [
      {
        id: "quickstart",
        titleKey: "resources4Group1Item1Title",
        descriptionKey: "resources4Group1Item1Description",
      },
      {
        id: "api-reference",
        titleKey: "resources4Group1Item2Title",
        descriptionKey: "resources4Group1Item2Description",
      },
      {
        id: "migration-guide",
        titleKey: "resources4Group1Item3Title",
        descriptionKey: "resources4Group1Item3Description",
      },
    ],
  },
  {
    id: "community",
    headingKey: "resources4Group2Heading",
    icon: IconUsers,
    items: [
      {
        id: "forum",
        titleKey: "resources4Group2Item1Title",
        descriptionKey: "resources4Group2Item1Description",
      },
      {
        id: "office-hours",
        titleKey: "resources4Group2Item2Title",
        descriptionKey: "resources4Group2Item2Description",
      },
      {
        id: "status-page",
        titleKey: "resources4Group2Item3Title",
        descriptionKey: "resources4Group2Item3Description",
      },
    ],
  },
  {
    id: "company",
    headingKey: "resources4Group3Heading",
    icon: IconBriefcase,
    items: [
      {
        id: "changelog",
        titleKey: "resources4Group3Item1Title",
        descriptionKey: "resources4Group3Item1Description",
      },
      {
        id: "brand-assets",
        titleKey: "resources4Group3Item2Title",
        descriptionKey: "resources4Group3Item2Description",
      },
      {
        id: "careers",
        titleKey: "resources4Group3Item3Title",
        descriptionKey: "resources4Group3Item3Description",
      },
    ],
  },
];

export function GroupedLinkListResources() {
  const t = useMessages("pages") as unknown as PagesWithResourcesMessages;
  const r = t.resources;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-muted text-xs font-semibold tracking-widest uppercase">
            {r.resources4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {r.resources4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{r.resources4Description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {GROUPS.map((group) => (
            <div key={group.id} className="flex flex-col gap-1">
              <div className="text-muted mb-2 flex items-center gap-2 text-sm font-semibold">
                <group.icon size={16} aria-hidden="true" />
                {r[group.headingKey]}
              </div>
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  href={LINK_URL}
                  className="group hover:bg-surface-hover -mx-2 flex items-start justify-between gap-2 rounded-lg px-2 py-2.5 transition-colors"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-fg text-sm font-medium">
                      {r[item.titleKey]}
                    </span>
                    <span className="text-muted text-xs leading-relaxed">
                      {r[item.descriptionKey]}
                    </span>
                  </span>
                  <IconArrowUpRight
                    size={15}
                    className="text-muted mt-0.5 -translate-y-0.5 translate-x-0.5 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-brand group-hover:opacity-100 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
