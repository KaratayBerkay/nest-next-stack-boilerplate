"use client";

import Image from "next/image";
import { IconAward } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAwardsMessages } from "@/types/pages/awards/AwardsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Accolade {
  id: string;
  yearKey: string;
  titleKey: string;
}

const SPOTLIGHT_SEED = "awards7-spotlight" as const;

const ACCOLADES: Accolade[] = [
  { id: "item-1", yearKey: "awards7Item1Year", titleKey: "awards7Item1Title" },
  { id: "item-2", yearKey: "awards7Item2Year", titleKey: "awards7Item2Title" },
  { id: "item-3", yearKey: "awards7Item3Year", titleKey: "awards7Item3Title" },
  { id: "item-4", yearKey: "awards7Item4Year", titleKey: "awards7Item4Title" },
  { id: "item-5", yearKey: "awards7Item5Year", titleKey: "awards7Item5Title" },
  { id: "item-6", yearKey: "awards7Item6Year", titleKey: "awards7Item6Title" },
];

export function SpotlightSplitAwards() {
  const t = useMessages("pages") as unknown as PagesWithAwardsMessages;
  const a = t.awards;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-fg text-2xl font-semibold tracking-tight sm:text-3xl">
              {a.awards7ListHeading}
            </h2>
            <p className="text-muted">{a.awards7ListDescription}</p>
          </div>
          <ul className="border-border divide-border flex flex-col divide-y border-t">
            {ACCOLADES.map((item) => (
              <li key={item.id} className="flex items-baseline gap-4 py-4">
                <span className="text-muted w-12 shrink-0 text-sm tabular-nums">
                  {a[item.yearKey]}
                </span>
                <span className="text-fg text-sm">{a[item.titleKey]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border bg-surface flex flex-col overflow-hidden rounded-3xl border">
          <div className="relative aspect-[3/2] overflow-hidden">
            <Image
              src={placeholderImage(SPOTLIGHT_SEED, "3x2")}
              alt={a.awards7SpotlightImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="from-fg/60 absolute inset-0 bg-gradient-to-t to-transparent" />
            <Badge variant="default" size="sm" className="absolute top-4 left-4 inline-flex items-center gap-1.5">
              <IconAward size={14} aria-hidden="true" />
              {a.awards7SpotlightEyebrow}
            </Badge>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <h3 className="text-fg text-xl font-semibold tracking-tight">
              {a.awards7SpotlightTitle}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {a.awards7SpotlightDescription}
            </p>
          </div>
          <div className="border-border border-t p-4">
            <Dialog>
              <DialogTrigger variant="outline" className="w-full">
                {a.awards7SpotlightCta}
              </DialogTrigger>
              <DialogContent size="md">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={placeholderImage(SPOTLIGHT_SEED, "3x2")}
                    alt={a.awards7SpotlightImageAlt}
                    fill
                    sizes="512px"
                    className="object-cover"
                  />
                </div>
                <DialogHeader>
                  <DialogTitle>{a.awards7SpotlightTitle}</DialogTitle>
                  <DialogDescription>{a.awards7DialogDescription}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose variant="outline">{a.awards7DialogClose}</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
}
