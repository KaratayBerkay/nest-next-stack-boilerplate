"use client";

import { useState, type Dispatch, type SetStateAction, type SyntheticEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { PagesWithTeamMessages } from "@/types/pages/team/TeamMessages-types";

interface Member {
  id: string;
  initials: string;
  avatarVariant: AvatarVariant;
  nameKey: string;
  roleKey: string;
  bioKey: string;
  focusKey: string;
}

// The Carousel primitive spreads native <div> props alongside a custom
// `onSelect(index: number)` prop, which TS intersects with the DOM
// `onSelect: ReactEventHandler<HTMLDivElement>` — a plain state setter
// can't satisfy both, so route through a small adapter like the other
// carousel variants in this codebase do.
function handleSelect(
  setSelectedIndex: Dispatch<SetStateAction<number>>,
): (index: number | SyntheticEvent) => void {
  return (index: number | SyntheticEvent) => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
  };
}

const MEMBERS: Member[] = [
  {
    id: "t4-1",
    initials: "NG",
    avatarVariant: "brand",
    nameKey: "team4Member1Name",
    roleKey: "team4Member1Role",
    bioKey: "team4Member1Bio",
    focusKey: "team4Member1Focus",
  },
  {
    id: "t4-2",
    initials: "TL",
    avatarVariant: "info",
    nameKey: "team4Member2Name",
    roleKey: "team4Member2Role",
    bioKey: "team4Member2Bio",
    focusKey: "team4Member2Focus",
  },
  {
    id: "t4-3",
    initials: "HK",
    avatarVariant: "success",
    nameKey: "team4Member3Name",
    roleKey: "team4Member3Role",
    bioKey: "team4Member3Bio",
    focusKey: "team4Member3Focus",
  },
  {
    id: "t4-4",
    initials: "BR",
    avatarVariant: "warning",
    nameKey: "team4Member4Name",
    roleKey: "team4Member4Role",
    bioKey: "team4Member4Bio",
    focusKey: "team4Member4Focus",
  },
  {
    id: "t4-5",
    initials: "DK",
    avatarVariant: "default",
    nameKey: "team4Member5Name",
    roleKey: "team4Member5Role",
    bioKey: "team4Member5Bio",
    focusKey: "team4Member5Focus",
  },
  {
    id: "t4-6",
    initials: "EW",
    avatarVariant: "brand",
    nameKey: "team4Member6Name",
    roleKey: "team4Member6Role",
    bioKey: "team4Member6Bio",
    focusKey: "team4Member6Focus",
  },
  {
    id: "t4-7",
    initials: "ZP",
    avatarVariant: "info",
    nameKey: "team4Member7Name",
    roleKey: "team4Member7Role",
    bioKey: "team4Member7Bio",
    focusKey: "team4Member7Focus",
  },
];

export function HorizontalScrollCarouselTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;
  const [selected, setSelected] = useState(0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.team4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.team4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.team4Intro}</p>
        </div>

        <Carousel
          className="mt-10"
          opts={{ loop: true, align: "start" }}
          onSelect={handleSelect(setSelected)}
          aria-label={tm.team4CarouselAria}
        >
          <CarouselContent>
            {MEMBERS.map((member) => (
              <CarouselItem key={member.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="border-border bg-surface mx-1 flex h-full flex-col gap-4 rounded-2xl border p-6">
                  <Avatar
                    fallback={member.initials}
                    size="lg"
                    variant={member.avatarVariant}
                  />
                  <div>
                    <p className="text-fg text-sm font-semibold">
                      {tm[member.nameKey]}
                    </p>
                    <p className="text-muted text-xs">{tm[member.roleKey]}</p>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">
                    {tm[member.bioKey]}
                  </p>
                  <p className="text-fg mt-auto text-xs font-medium">
                    {tm.team4FocusLabel}: {tm[member.focusKey]}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="mt-6 flex justify-center gap-2">
          {MEMBERS.map((member, index) => (
            <span
              key={member.id}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                index === selected ? "bg-brand" : "bg-border",
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
