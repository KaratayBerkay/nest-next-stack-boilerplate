"use client";

import Image from "next/image";
import { IconTrophy } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CONTRIBUTORS = [
  {
    id: "ada",
    nameKey: "feature255Item1Name",
    roleKey: "feature255Item1Role",
    pointsKey: "feature255Item1Points",
    avatarSrc: "https://picsum.photos/seed/feature255-1/96/96",
  },
  {
    id: "marcus",
    nameKey: "feature255Item2Name",
    roleKey: "feature255Item2Role",
    pointsKey: "feature255Item2Points",
    avatarSrc: "https://picsum.photos/seed/feature255-2/96/96",
  },
  {
    id: "sofia",
    nameKey: "feature255Item3Name",
    roleKey: "feature255Item3Role",
    pointsKey: "feature255Item3Points",
    avatarSrc: "https://picsum.photos/seed/feature255-3/96/96",
  },
  {
    id: "jonas",
    nameKey: "feature255Item4Name",
    roleKey: "feature255Item4Role",
    pointsKey: "feature255Item4Points",
    avatarSrc: "https://picsum.photos/seed/feature255-4/96/96",
  },
] as const;

export function ContributorsHeaderFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature255Heading}
          </h2>
          <span className="border-border text-fg inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-medium sm:self-auto">
            <IconTrophy size={16} className="text-brand" aria-hidden="true" />
            {f.feature255ActionLabel}
          </span>
        </div>
        <div className="border-border divide-border mt-10 divide-y rounded-lg border">
          {CONTRIBUTORS.map((contributor) => (
            <div
              key={contributor.id}
              className="flex items-center gap-4 px-6 py-5"
            >
              <Image
                src={contributor.avatarSrc}
                alt={f[contributor.nameKey]}
                width={96}
                height={96}
                className="size-11 shrink-0 rounded-full object-cover"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-fg text-sm font-semibold">
                  {f[contributor.nameKey]}
                </span>
                <span className="text-muted text-xs">
                  {f[contributor.roleKey]}
                </span>
              </div>
              <span className="text-fg ml-auto text-sm font-semibold tabular-nums">
                {f[contributor.pointsKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
