"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectMessages } from "@/types/pages/project/ProjectMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const LINK_URL = "https://example.com" as const;

interface Fact {
  labelKey: string;
  valueKey: string;
}

const FACTS: Fact[] = [
  { labelKey: "project5Fact1Label", valueKey: "project5Fact1Value" },
  { labelKey: "project5Fact2Label", valueKey: "project5Fact2Value" },
  { labelKey: "project5Fact3Label", valueKey: "project5Fact3Value" },
  { labelKey: "project5Fact4Label", valueKey: "project5Fact4Value" },
];

export function MinimalBriefProject() {
  const t = useMessages("pages") as unknown as PagesWithProjectMessages;
  const p = t.project;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col gap-10 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.project5Title}
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            {p.project5Summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {FACTS.map((fact, index) => (
            <div key={fact.labelKey} className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-muted text-xs">{p[fact.labelKey]}</span>
                <span className="text-fg text-sm font-medium">
                  {p[fact.valueKey]}
                </span>
              </div>
              {index < FACTS.length - 1 && (
                <Separator orientation="vertical" className="h-8" />
              )}
            </div>
          ))}
        </div>

        <div className="border-border overflow-hidden rounded-2xl border">
          <AspectRatio ratio={4 / 3}>
            <Image
              src={placeholderImage("project-minimal-brief", "4x3")}
              alt={p.project5HeroAlt}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
          </AspectRatio>
        </div>

        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-fg text-lg font-semibold">
            {p.project5BodyHeading}
          </h2>
          <p className="text-muted leading-relaxed">{p.project5Body}</p>
        </div>

        <div className="flex justify-center">
          <Button asChild variant="primary">
            <a href={LINK_URL} target="_blank" rel="noopener noreferrer">
              {p.project5Cta}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
