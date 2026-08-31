"use client";

import Image from "next/image";
import { useState } from "react";
import { IconCircleCheck, IconSparkles } from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithWaitlistMessages } from "@/types/pages/waitlist/WaitlistMessages-types";

const PERKS = [
  {
    id: "perk-1",
    titleKey: "waitlist3Perk1Title",
    descKey: "waitlist3Perk1Desc",
  },
  {
    id: "perk-2",
    titleKey: "waitlist3Perk2Title",
    descKey: "waitlist3Perk2Desc",
  },
  {
    id: "perk-3",
    titleKey: "waitlist3Perk3Title",
    descKey: "waitlist3Perk3Desc",
  },
] as const;

const TESTERS = [
  { id: "tester-1", seed: "waitlist3-tester-1", initials: "JD" },
  { id: "tester-2", seed: "waitlist3-tester-2", initials: "KO" },
  { id: "tester-3", seed: "waitlist3-tester-3", initials: "EM" },
] as const;

export function SplitPhotoWaitlist() {
  const t = useMessages("pages") as unknown as PagesWithWaitlistMessages;
  const w = t.waitlist;
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6 lg:order-1">
          <span className="text-brand flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase">
            <IconSparkles size={14} aria-hidden="true" />
            {w.waitlist3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
            {w.waitlist3Heading}
          </h2>
          <p className="text-muted text-base">{w.waitlist3Body}</p>

          <ol className="flex flex-col gap-4">
            {PERKS.map((perk, index) => (
              <li
                key={perk.id}
                className={cn(
                  "flex items-start gap-3.5",
                  index > 0 && "border-border border-t pt-4",
                )}
              >
                <span className="bg-brand/10 text-brand flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-fg text-sm font-semibold">
                    {w[perk.titleKey]}
                  </span>
                  <span className="text-muted text-sm">{w[perk.descKey]}</span>
                </div>
              </li>
            ))}
          </ol>

          {joined ? (
            <div className="border-success/30 bg-success/10 text-success flex w-full max-w-sm items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium">
              <IconCircleCheck size={18} aria-hidden="true" />
              {w.waitlist3SuccessMessage}
            </div>
          ) : (
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                setJoined(true);
              }}
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={w.waitlist3Placeholder}
                aria-label={w.waitlist3Placeholder}
                className="flex-1"
              />
              <Button type="submit" variant="primary" className="shrink-0">
                {w.waitlist3Submit}
              </Button>
            </form>
          )}
          {!joined && (
            <span className="text-muted text-xs">{w.waitlist3FinePrint}</span>
          )}
        </div>

        <div className="relative lg:order-2">
          <div className="border-border bg-surface relative aspect-[4/5] overflow-hidden rounded-3xl border">
            <Image
              src={placeholderImage("waitlist-3-hero", "4x5")}
              alt={w.waitlist3ImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="border-border bg-bg absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg">
            <AvatarGroup max={3} size="sm">
              {TESTERS.map((tester) => (
                <Avatar
                  key={tester.id}
                  size="sm"
                  src={placeholderImage(tester.seed, "1x1")}
                  fallback={tester.initials}
                />
              ))}
            </AvatarGroup>
            <span className="text-fg text-xs font-medium">
              {w.waitlist3StatBadge}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
