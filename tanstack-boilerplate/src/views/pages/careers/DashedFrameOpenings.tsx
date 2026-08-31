"use client";

import {
  IconArrowRight,
  IconClock,
  IconMapPin,
  IconWorld,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers2Job,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;

const GRID_PATTERN = {
  backgroundImage:
    "repeating-linear-gradient(90deg, transparent 0 4px, color-mix(in srgb, var(--muted) 45%, transparent) 4px 8px), repeating-linear-gradient(180deg, transparent 0 4px, color-mix(in srgb, var(--muted) 45%, transparent) 4px 8px)",
  maskImage:
    "radial-gradient(ellipse 90% 100% at 50% 0%, black 20%, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 90% 100% at 50% 0%, black 20%, transparent 75%)",
} as const;

const OPENINGS: Careers2Job[] = [
  {
    titleKey: "careers2Job1Title",
    typeKey: "careers2Job1Type",
    cityKey: "careers2Job1City",
    remoteKey: "careers2Job1Remote",
  },
  {
    titleKey: "careers2Job2Title",
    typeKey: "careers2Job2Type",
    cityKey: "careers2Job2City",
    remoteKey: "careers2Job2Remote",
  },
  {
    titleKey: "careers2Job3Title",
    typeKey: "careers2Job3Type",
    cityKey: "careers2Job3City",
    remoteKey: "careers2Job3Remote",
  },
  {
    titleKey: "careers2Job4Title",
    typeKey: "careers2Job4Type",
    cityKey: "careers2Job4City",
    remoteKey: "careers2Job4Remote",
  },
  {
    titleKey: "careers2Job5Title",
    typeKey: "careers2Job5Type",
    cityKey: "careers2Job5City",
    remoteKey: "careers2Job5Remote",
  },
];

export function DashedFrameOpenings() {
  const t = useMessages("pages") as unknown as PagesWithCareersMessages;
  const careers = t.careers;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface relative overflow-hidden rounded-3xl border">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={GRID_PATTERN}
          />
          <div className="relative flex flex-col gap-10 px-6 py-12 lg:px-12 lg:py-16">
            <div className="flex max-w-2xl flex-col gap-4">
              <div>
                <Badge variant="outline" size="sm">
                  {careers.careers2Badge}
                </Badge>
              </div>
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {careers.careers2Heading}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {careers.careers2HiringNote}
              </Typography>
            </div>

            <div className="border-border divide-border divide-y divide-dashed rounded-3xl border border-dashed">
              {OPENINGS.map((job) => (
                <div
                  key={job.titleKey}
                  className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_auto] lg:items-center lg:gap-8 lg:px-8"
                >
                  <a
                    href={LINK_URL}
                    className="hover:text-brand text-lg font-medium tracking-tight transition-colors lg:text-xl"
                  >
                    {careers[job.titleKey]}
                  </a>
                  <ul className="text-muted flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <li className="flex items-center gap-1.5">
                      <IconClock size={16} aria-hidden="true" />
                      {careers[job.typeKey]}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <IconMapPin size={16} aria-hidden="true" />
                      {careers[job.cityKey]}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <IconWorld size={16} aria-hidden="true" />
                      {careers[job.remoteKey]}
                    </li>
                  </ul>
                  <Button asChild variant="primary" size="sm" className="w-fit">
                    <a href={LINK_URL} className="group/apply">
                      {careers.careers2Apply}
                      <IconArrowRight
                        size={15}
                        aria-hidden="true"
                        className="transition-transform group-hover/apply:translate-x-0.5"
                      />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
