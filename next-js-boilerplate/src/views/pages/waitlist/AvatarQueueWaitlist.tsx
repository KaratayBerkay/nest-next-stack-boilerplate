"use client";

import { useState } from "react";
import {
  IconListNumbers,
  IconRocket,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithWaitlistMessages } from "@/types/pages/waitlist/WaitlistMessages-types";

const MEMBERS = [
  { id: "member-1", seed: "waitlist1-member-1", initials: "AK" },
  { id: "member-2", seed: "waitlist1-member-2", initials: "MB" },
  { id: "member-3", seed: "waitlist1-member-3", initials: "SL" },
  { id: "member-4", seed: "waitlist1-member-4", initials: "RP" },
  { id: "member-5", seed: "waitlist1-member-5", initials: "TN" },
] as const;

const QUEUE_POSITION = 2431;
const BATCH_FILL_PERCENT = 62;

export function AvatarQueueWaitlist() {
  const t = useMessages("pages") as unknown as PagesWithWaitlistMessages;
  const w = t.waitlist;
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 text-center lg:px-8">
        <Badge variant="soft" size="sm" pill className="gap-1.5">
          <IconRocket size={13} aria-hidden="true" />
          {w.waitlist1Eyebrow}
        </Badge>
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {w.waitlist1Heading}
        </h2>
        <p className="text-muted text-base">{w.waitlist1Body}</p>

        <div className="flex items-center gap-3">
          <AvatarGroup max={5} size="sm">
            {MEMBERS.map((member) => (
              <Avatar
                key={member.id}
                size="sm"
                src={placeholderImage(member.seed, "1x1")}
                fallback={member.initials}
              />
            ))}
          </AvatarGroup>
          <span className="text-muted text-sm">{w.waitlist1SocialProof}</span>
        </div>

        {joined ? (
          <div className="border-border bg-surface flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border p-5">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-full">
              <IconListNumbers size={18} aria-hidden="true" />
            </span>
            <p className="text-fg text-sm font-semibold">
              {w.waitlist1QueuePosition.replace(
                "{position}",
                String(QUEUE_POSITION),
              )}
            </p>
            <p className="text-muted text-xs">{w.waitlist1QueueSubtext}</p>
            <div className="flex w-full flex-col gap-1.5">
              <Progress value={BATCH_FILL_PERCENT} showValueLabel size="sm" />
              <span className="text-muted text-xs">
                {w.waitlist1BatchLabel}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setJoined(false);
                setEmail("");
              }}
            >
              {w.waitlist1ResetButton}
            </Button>
          </div>
        ) : (
          <form
            className="flex w-full max-w-sm gap-2"
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
              placeholder={w.waitlist1Placeholder}
              aria-label={w.waitlist1Placeholder}
              className="flex-1"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              {w.waitlist1Submit}
            </Button>
          </form>
        )}

        {!joined && (
          <div className="text-muted flex items-center gap-1.5 text-xs">
            <IconShieldCheck size={14} aria-hidden="true" />
            {w.waitlist1PrivacyNote}
          </div>
        )}
      </div>
    </section>
  );
}
