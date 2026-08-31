"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChangelogMessages } from "@/types/pages/changelog/ChangelogMessages-types";

interface TimelineEntry {
  id: string;
  dateKey: string;
  versionKey: string;
  titleKey: string;
  descriptionKey: string;
}

const ENTRIES: TimelineEntry[] = [
  {
    id: "changelog2-1",
    dateKey: "changelog2Entry1Date",
    versionKey: "changelog2Entry1Version",
    titleKey: "changelog2Entry1Title",
    descriptionKey: "changelog2Entry1Description",
  },
  {
    id: "changelog2-2",
    dateKey: "changelog2Entry2Date",
    versionKey: "changelog2Entry2Version",
    titleKey: "changelog2Entry2Title",
    descriptionKey: "changelog2Entry2Description",
  },
  {
    id: "changelog2-3",
    dateKey: "changelog2Entry3Date",
    versionKey: "changelog2Entry3Version",
    titleKey: "changelog2Entry3Title",
    descriptionKey: "changelog2Entry3Description",
  },
  {
    id: "changelog2-4",
    dateKey: "changelog2Entry4Date",
    versionKey: "changelog2Entry4Version",
    titleKey: "changelog2Entry4Title",
    descriptionKey: "changelog2Entry4Description",
  },
  {
    id: "changelog2-5",
    dateKey: "changelog2Entry5Date",
    versionKey: "changelog2Entry5Version",
    titleKey: "changelog2Entry5Title",
    descriptionKey: "changelog2Entry5Description",
  },
];

function handleSubscribe(
  event: FormEvent<HTMLFormElement>,
  email: string,
  setSubscribed: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  if (!email.trim()) return;
  setSubscribed(true);
}

export function HeroTimelineChangelog() {
  const t = useMessages("pages") as unknown as PagesWithChangelogMessages;
  const c = t.changelog;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center lg:px-8">
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          {c.changelog2Eyebrow}
        </span>
        <h2 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
          {c.changelog2Heading}
        </h2>
        <p className="text-muted max-w-xl text-lg leading-relaxed">
          {c.changelog2Subheading}
        </p>

        <div className="mt-2 flex w-full max-w-md items-center justify-center">
          {subscribed ? (
            <p className="bg-success/10 text-success rounded-full px-5 py-2.5 text-sm font-medium">
              {c.changelog2SubscribeSuccess}
            </p>
          ) : (
            <form
              onSubmit={(event) => handleSubscribe(event, email, setSubscribed)}
              className="flex w-full flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={c.changelog2EmailPlaceholder}
                aria-label={c.changelog2EmailPlaceholder}
                className="flex-1"
              />
              <Button type="submit" variant="primary">
                {c.changelog2SubscribeButton}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl px-6 lg:px-8">
        <ol className="flex flex-col gap-10">
          {ENTRIES.map((entry, index) => (
            <li
              key={entry.id}
              className={cn(
                "relative pl-8",
                index !== ENTRIES.length - 1 && "border-border border-l",
              )}
            >
              <span
                className="bg-brand border-bg absolute top-0.5 -left-[7px] size-3 rounded-full border-2"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-muted text-sm">{c[entry.dateKey]}</span>
                <Badge variant="secondary" size="sm">
                  {c[entry.versionKey]}
                </Badge>
              </div>
              <h3 className="text-fg mt-1.5 text-lg font-semibold tracking-tight">
                {c[entry.titleKey]}
              </h3>
              <p className="text-muted mt-1">{c[entry.descriptionKey]}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
