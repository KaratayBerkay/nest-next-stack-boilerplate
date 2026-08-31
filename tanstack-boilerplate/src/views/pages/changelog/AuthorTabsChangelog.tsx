"use client";

import { Avatar } from "@/components/ui/Avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChangelogMessages } from "@/types/pages/changelog/ChangelogMessages-types";

interface ChangelogEntry {
  id: string;
  versionKey: string;
  dateKey: string;
  titleKey: string;
  bodyKey: string;
  authorNameKey: string;
  authorRoleKey: string;
}

const ENTRIES: ChangelogEntry[] = [
  {
    id: "changelog5-1",
    versionKey: "changelog5Entry1Version",
    dateKey: "changelog5Entry1Date",
    titleKey: "changelog5Entry1Title",
    bodyKey: "changelog5Entry1Body",
    authorNameKey: "changelog5Entry1AuthorName",
    authorRoleKey: "changelog5Entry1AuthorRole",
  },
  {
    id: "changelog5-2",
    versionKey: "changelog5Entry2Version",
    dateKey: "changelog5Entry2Date",
    titleKey: "changelog5Entry2Title",
    bodyKey: "changelog5Entry2Body",
    authorNameKey: "changelog5Entry2AuthorName",
    authorRoleKey: "changelog5Entry2AuthorRole",
  },
  {
    id: "changelog5-3",
    versionKey: "changelog5Entry3Version",
    dateKey: "changelog5Entry3Date",
    titleKey: "changelog5Entry3Title",
    bodyKey: "changelog5Entry3Body",
    authorNameKey: "changelog5Entry3AuthorName",
    authorRoleKey: "changelog5Entry3AuthorRole",
  },
  {
    id: "changelog5-4",
    versionKey: "changelog5Entry4Version",
    dateKey: "changelog5Entry4Date",
    titleKey: "changelog5Entry4Title",
    bodyKey: "changelog5Entry4Body",
    authorNameKey: "changelog5Entry4AuthorName",
    authorRoleKey: "changelog5Entry4AuthorRole",
  },
];

export function AuthorTabsChangelog() {
  const t = useMessages("pages") as unknown as PagesWithChangelogMessages;
  const c = t.changelog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-fg text-3xl font-medium tracking-tight lg:text-4xl">
            {c.changelog5Heading}
          </h2>
          <p className="text-muted">{c.changelog5Intro}</p>
        </div>

        <Tabs defaultValue={ENTRIES[0].id}>
          <TabsList className="sticky top-4 z-10 flex-wrap">
            {ENTRIES.map((entry) => (
              <TabsTrigger key={entry.id} value={entry.id}>
                {c[entry.versionKey]}
              </TabsTrigger>
            ))}
          </TabsList>
          {ENTRIES.map((entry) => (
            <TabsContent
              key={entry.id}
              value={entry.id}
              className="flex flex-col gap-5 pt-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-fg font-medium">
                  {c[entry.versionKey]}
                </span>
                <span className="text-muted text-sm">{c[entry.dateKey]}</span>
              </div>
              <h3 className="text-fg text-2xl font-semibold tracking-tight">
                {c[entry.titleKey]}
              </h3>
              <p className="text-muted leading-relaxed">{c[entry.bodyKey]}</p>
              <div className="border-border flex items-center gap-3 border-t pt-5">
                <Avatar size="sm" fallback={c[entry.authorNameKey]} />
                <div className="flex flex-col">
                  <span className="text-fg text-sm font-medium">
                    {c[entry.authorNameKey]}
                  </span>
                  <span className="text-muted text-xs">
                    {c[entry.authorRoleKey]}
                  </span>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
