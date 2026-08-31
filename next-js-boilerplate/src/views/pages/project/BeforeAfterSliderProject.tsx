"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectMessages } from "@/types/pages/project/ProjectMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const DEFAULT_REVEAL = 50;

interface Stat {
  labelKey: string;
  valueKey: string;
}

const STATS: Stat[] = [
  { labelKey: "project6Stat1Label", valueKey: "project6Stat1Value" },
  { labelKey: "project6Stat2Label", valueKey: "project6Stat2Value" },
  { labelKey: "project6Stat3Label", valueKey: "project6Stat3Value" },
];

const STACK_KEYS = [
  "project6Stack1",
  "project6Stack2",
  "project6Stack3",
  "project6Stack4",
] as const;

export function BeforeAfterSliderProject() {
  const t = useMessages("pages") as unknown as PagesWithProjectMessages;
  const p = t.project;
  const [reveal, setReveal] = useState<number>(DEFAULT_REVEAL);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.project6Title}
          </h1>
          <p className="text-muted max-w-2xl text-lg leading-relaxed">
            {p.project6Summary}
          </p>
        </div>

        <div className="border-border bg-surface relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border">
          <Image
            src={placeholderImage("project-before", "16x9")}
            alt={p.project6BeforeAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
          >
            <Image
              src={placeholderImage("project-after", "16x9")}
              alt={p.project6AfterAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 80vw"
              className="object-cover"
            />
          </div>
          <div
            className="bg-bg pointer-events-none absolute top-0 bottom-0 w-0.5 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
            style={{ left: `${reveal}%` }}
          />
          <Badge
            variant="secondary"
            className="absolute top-4 left-4 shadow-sm"
          >
            {p.project6BeforeLabel}
          </Badge>
          <Badge
            variant="secondary"
            className="absolute top-4 right-4 shadow-sm"
          >
            {p.project6AfterLabel}
          </Badge>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-muted text-sm">{p.project6SliderCaption}</span>
          <Slider
            value={[reveal]}
            onValueChange={(value) => setReveal(value[0])}
            min={0}
            max={100}
            step={1}
          />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-14">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <h2 className="text-fg text-xl font-semibold">
              {p.project6StoryHeading}
            </h2>
            <p className="text-muted leading-relaxed">{p.project6StoryBody}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-muted text-xs">{p.project6StackLabel}</span>
              {STACK_KEYS.map((key) => (
                <Badge key={key} variant="outline">
                  {p[key]}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {STATS.map((stat) => (
              <div
                key={stat.labelKey}
                className="border-border bg-surface flex flex-col gap-1 rounded-lg border p-4"
              >
                <span className="text-fg text-xl font-semibold">
                  {p[stat.valueKey]}
                </span>
                <span className="text-muted text-xs">{p[stat.labelKey]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
