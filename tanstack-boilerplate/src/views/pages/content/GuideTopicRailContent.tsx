"use client";

import { useState } from "react";
import {
  IconAlertTriangle,
  IconChecklist,
  IconCompass,
  IconSettings,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import { Progress } from "@/components/ui/Progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContentMessages } from "@/types/pages/content/ContentMessages-types";

const CHAPTERS: {
  id: string;
  icon: Icon;
  labelKey: string;
  headingKey: string;
  paragraphKey: string;
  takeawayKey: string;
}[] = [
  {
    id: "overview",
    icon: IconCompass,
    labelKey: "content3Chapter1Label",
    headingKey: "content3Chapter1Heading",
    paragraphKey: "content3Chapter1Paragraph",
    takeawayKey: "content3Chapter1Takeaway",
  },
  {
    id: "prerequisites",
    icon: IconChecklist,
    labelKey: "content3Chapter2Label",
    headingKey: "content3Chapter2Heading",
    paragraphKey: "content3Chapter2Paragraph",
    takeawayKey: "content3Chapter2Takeaway",
  },
  {
    id: "configuration",
    icon: IconSettings,
    labelKey: "content3Chapter3Label",
    headingKey: "content3Chapter3Heading",
    paragraphKey: "content3Chapter3Paragraph",
    takeawayKey: "content3Chapter3Takeaway",
  },
  {
    id: "troubleshooting",
    icon: IconAlertTriangle,
    labelKey: "content3Chapter4Label",
    headingKey: "content3Chapter4Heading",
    paragraphKey: "content3Chapter4Paragraph",
    takeawayKey: "content3Chapter4Takeaway",
  },
];

export function GuideTopicRailContent() {
  const t = useMessages("pages") as unknown as PagesWithContentMessages;
  const c = t.content;
  const [activeChapter, setActiveChapter] = useState<string>(CHAPTERS[0].id);

  const activeIndex = Math.max(
    0,
    CHAPTERS.findIndex((chapter) => chapter.id === activeChapter),
  );
  const progressValue = ((activeIndex + 1) / CHAPTERS.length) * 100;
  const progressLabel = c.content3ProgressLabel.replace(
    "{current}",
    String(activeIndex + 1),
  ).replace("{total}", String(CHAPTERS.length));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                {c.content3BreadcrumbHome}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                {c.content3BreadcrumbGuides}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{c.content3Title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {c.content3Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {c.content3Subtext}
          </Typography>
          <div className="flex max-w-sm items-center gap-3">
            <Progress value={progressValue} size="sm" className="flex-1" />
            <span className="text-muted shrink-0 text-xs font-medium tabular-nums">
              {progressLabel}
            </span>
          </div>
        </div>

        <Tabs
          value={activeChapter}
          onValueChange={setActiveChapter}
          orientation="vertical"
          className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10"
        >
          <div className="lg:sticky lg:top-24 lg:w-64 lg:shrink-0">
            <TabsList className="w-full">
              {CHAPTERS.map((chapter) => (
                <TabsTrigger
                  key={chapter.id}
                  value={chapter.id}
                  className="w-full"
                >
                  <span className="flex w-full items-center gap-2.5">
                    <chapter.icon
                      size={16}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">{c[chapter.labelKey]}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="min-w-0 flex-1">
            {CHAPTERS.map((chapter) => (
              <TabsContent
                key={chapter.id}
                value={chapter.id}
                className="flex flex-col gap-4"
              >
                <Typography
                  variant="h3"
                  className="text-2xl font-medium tracking-tighter"
                >
                  {c[chapter.headingKey]}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {c[chapter.paragraphKey]}
                </Typography>
                <div className="bg-info/10 border-info/30 flex flex-col gap-1 rounded-xl border p-4">
                  <span className="text-info text-xs font-semibold tracking-wider uppercase">
                    {c.content3TakeawayLabel}
                  </span>
                  <p className="text-fg text-sm leading-relaxed">
                    {c[chapter.takeawayKey]}
                  </p>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
