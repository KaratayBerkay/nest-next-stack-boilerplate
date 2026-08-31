"use client";

import { useState } from "react";
import { IconArrowRight, IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithNewsletterMessages } from "@/types/pages/newsletter/NewsletterMessages-types";

const STATS = [
  {
    id: "stat-1",
    valueKey: "newsletter5Stat1Value",
    labelKey: "newsletter5Stat1Label",
  },
  {
    id: "stat-2",
    valueKey: "newsletter5Stat2Value",
    labelKey: "newsletter5Stat2Label",
  },
  {
    id: "stat-3",
    valueKey: "newsletter5Stat3Value",
    labelKey: "newsletter5Stat3Label",
  },
] as const;

export function InvertedBandNewsletter() {
  const t = useMessages("pages") as unknown as PagesWithNewsletterMessages;
  const n = t.newsletter;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="bg-fg text-bg w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {n.newsletter5Heading}
        </h2>
        <p className="text-bg/70 text-base">{n.newsletter5Body}</p>

        {subscribed ? (
          <div className="border-bg/20 bg-bg/10 flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium">
            <IconCircleCheck size={18} aria-hidden="true" />
            {n.newsletter5SuccessMessage}
          </div>
        ) : (
          <form
            className="flex w-full max-w-sm gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setSubscribed(true);
            }}
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={n.newsletter5Placeholder}
              aria-label={n.newsletter5Placeholder}
              className="bg-bg/10 border-bg/20 text-bg placeholder:text-bg/50 flex-1"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              {n.newsletter5Submit}
              <IconArrowRight size={14} aria-hidden="true" />
            </Button>
          </form>
        )}

        <div className="mt-4 grid w-full max-w-lg grid-cols-3">
          {STATS.map((stat, index) => (
            <div
              key={stat.id}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2",
                index > 0 && "border-bg/15 border-l",
              )}
            >
              <span className="text-xl font-semibold">{n[stat.valueKey]}</span>
              <span className="text-bg/60 text-xs">{n[stat.labelKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
