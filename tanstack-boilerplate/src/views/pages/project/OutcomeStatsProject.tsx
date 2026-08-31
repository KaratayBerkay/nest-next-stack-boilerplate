"use client";

import Image from "next/image";
import { IconCircleCheck } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectMessages } from "@/types/pages/project/ProjectMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Metric {
  labelKey: string;
  valueKey: string;
  progress: number;
}

const METRICS: Metric[] = [
  { labelKey: "project7Metric1Label", valueKey: "project7Metric1Value", progress: 92 },
  { labelKey: "project7Metric2Label", valueKey: "project7Metric2Value", progress: 68 },
  { labelKey: "project7Metric3Label", valueKey: "project7Metric3Value", progress: 100 },
];

const DELIVERABLE_KEYS = [
  "project7Deliverable1",
  "project7Deliverable2",
  "project7Deliverable3",
  "project7Deliverable4",
] as const;

const STACK_KEYS = [
  "project7Stack1",
  "project7Stack2",
  "project7Stack3",
  "project7Stack4",
  "project7Stack5",
] as const;

interface GalleryImage {
  altKey: string;
  imageSeed: string;
}

const GALLERY: GalleryImage[] = [
  { altKey: "project7Gallery1Alt", imageSeed: "project-outcome-1" },
  { altKey: "project7Gallery2Alt", imageSeed: "project-outcome-2" },
  { altKey: "project7Gallery3Alt", imageSeed: "project-outcome-3" },
  { altKey: "project7Gallery4Alt", imageSeed: "project-outcome-4" },
];

export function OutcomeStatsProject() {
  const t = useMessages("pages") as unknown as PagesWithProjectMessages;
  const p = t.project;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Badge variant="soft">{p.project7Eyebrow}</Badge>
          <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.project7Title}
          </h1>
          <p className="text-muted max-w-2xl text-lg leading-relaxed">
            {p.project7Summary}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="border-border bg-surface flex flex-col gap-1 rounded-lg border p-4">
            <span className="text-muted text-xs">{p.project7ClientLabel}</span>
            <span className="text-fg text-sm font-medium">
              {p.project7ClientValue}
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-1 rounded-lg border p-4">
            <span className="text-muted text-xs">{p.project7RoleLabel}</span>
            <span className="text-fg text-sm font-medium">
              {p.project7RoleValue}
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-1 rounded-lg border p-4">
            <span className="text-muted text-xs">
              {p.project7TimelineLabel}
            </span>
            <span className="text-fg text-sm font-medium">
              {p.project7TimelineValue}
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="text-fg text-xl font-semibold">
              {p.project7OutcomesHeading}
            </h2>
            {METRICS.map((metric) => (
              <div key={metric.labelKey} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted text-sm">
                    {p[metric.labelKey]}
                  </span>
                  <span className="text-fg text-sm font-semibold">
                    {p[metric.valueKey]}
                  </span>
                </div>
                <Progress value={metric.progress} size="sm" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-fg text-xl font-semibold">
              {p.project7DeliverablesHeading}
            </h2>
            <ul className="flex flex-col gap-2">
              {DELIVERABLE_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm">
                  <IconCircleCheck
                    size={16}
                    className="text-brand mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-muted">{p[key]}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-muted text-xs">
                {p.project7StackLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {STACK_KEYS.map((key) => (
                  <Badge key={key} variant="secondary">
                    {p[key]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4">
          <h2 className="text-fg text-xl font-semibold">
            {p.project7GalleryHeading}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GALLERY.map((image) => (
              <div
                key={image.altKey}
                className="border-border overflow-hidden rounded-lg border"
              >
                <AspectRatio ratio={1}>
                  <Image
                    src={placeholderImage(image.imageSeed, "1x1")}
                    alt={p[image.altKey]}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                </AspectRatio>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
