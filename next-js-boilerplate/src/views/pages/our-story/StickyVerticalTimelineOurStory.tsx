"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOurStoryMessages } from "@/types/pages/our-story/OurStoryMessages-types";

interface TimelineEntry {
  id: string;
  yearKey: string;
  headingKey: string;
  bodyKey: string;
}

const ENTRIES: TimelineEntry[] = [
  {
    id: "founded",
    yearKey: "ourStory4Entry1Year",
    headingKey: "ourStory4Entry1Heading",
    bodyKey: "ourStory4Entry1Body",
  },
  {
    id: "shipped",
    yearKey: "ourStory4Entry2Year",
    headingKey: "ourStory4Entry2Heading",
    bodyKey: "ourStory4Entry2Body",
  },
  {
    id: "office",
    yearKey: "ourStory4Entry3Year",
    headingKey: "ourStory4Entry3Heading",
    bodyKey: "ourStory4Entry3Body",
  },
  {
    id: "funding",
    yearKey: "ourStory4Entry4Year",
    headingKey: "ourStory4Entry4Heading",
    bodyKey: "ourStory4Entry4Body",
  },
  {
    id: "million-users",
    yearKey: "ourStory4Entry5Year",
    headingKey: "ourStory4Entry5Heading",
    bodyKey: "ourStory4Entry5Body",
  },
  {
    id: "today",
    yearKey: "ourStory4Entry6Year",
    headingKey: "ourStory4Entry6Heading",
    bodyKey: "ourStory4Entry6Body",
  },
];

export function StickyVerticalTimelineOurStory() {
  const t = useMessages("pages") as unknown as PagesWithOurStoryMessages;
  const os = t.ourStory;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-12 px-4 md:grid-cols-5 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-5 md:sticky md:top-24 md:col-span-2 md:h-fit">
          <Avatar
            fallback={os.ourStory4SidebarName}
            size="lg"
            variant="brand"
          />
          <Badge variant="secondary" className="w-fit">
            {os.ourStory4SidebarBadge}
          </Badge>
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {os.ourStory4SidebarHeading}
          </Typography>
          <Typography variant="body" className="text-muted">
            {os.ourStory4SidebarBody}
          </Typography>
        </div>

        <div className="relative flex flex-col gap-10 pl-10 md:col-span-3">
          <div
            aria-hidden="true"
            className="bg-border absolute top-1 bottom-1 left-[7px] w-px"
          />
          {ENTRIES.map((entry) => (
            <div key={entry.id} className="relative flex flex-col gap-2">
              <span
                aria-hidden="true"
                className="bg-brand ring-bg absolute top-1 left-[7px] size-3 -translate-x-1/2 rounded-full ring-4"
              />
              <span className="text-muted font-mono text-sm tabular-nums">
                {os[entry.yearKey]}
              </span>
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {os[entry.headingKey]}
              </Typography>
              <Typography variant="body" className="text-muted">
                {os[entry.bodyKey]}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
