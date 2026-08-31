"use client";

import { useState } from "react";
import { IconMail, IconMailCheck, IconShieldCheck } from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithNewsletterMessages } from "@/types/pages/newsletter/NewsletterMessages-types";

const READERS = [
  { id: "reader-1", seed: "newsletter1-reader-1", initials: "AK" },
  { id: "reader-2", seed: "newsletter1-reader-2", initials: "MB" },
  { id: "reader-3", seed: "newsletter1-reader-3", initials: "SL" },
  { id: "reader-4", seed: "newsletter1-reader-4", initials: "RP" },
  { id: "reader-5", seed: "newsletter1-reader-5", initials: "TN" },
] as const;

export function CenteredProofNewsletter() {
  const t = useMessages("pages") as unknown as PagesWithNewsletterMessages;
  const n = t.newsletter;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 text-center lg:px-8">
        <Badge variant="soft" size="sm" pill className="gap-1.5">
          <IconMail size={13} aria-hidden="true" />
          {n.newsletter1Eyebrow}
        </Badge>
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {n.newsletter1Heading}
        </h2>
        <p className="text-muted text-base">{n.newsletter1Body}</p>

        <div className="flex items-center gap-3">
          <AvatarGroup max={5} size="sm">
            {READERS.map((reader) => (
              <Avatar
                key={reader.id}
                size="sm"
                src={placeholderImage(reader.seed, "1x1")}
                fallback={reader.initials}
              />
            ))}
          </AvatarGroup>
          <span className="text-muted text-sm">{n.newsletter1SocialProof}</span>
        </div>

        {subscribed ? (
          <div className="border-success/30 bg-success/10 text-success flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium">
            <IconMailCheck size={18} aria-hidden="true" />
            {n.newsletter1SuccessMessage}
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
              placeholder={n.newsletter1Placeholder}
              aria-label={n.newsletter1Placeholder}
              className="flex-1"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              {n.newsletter1Submit}
            </Button>
          </form>
        )}

        {!subscribed && (
          <div className="text-muted flex items-center gap-1.5 text-xs">
            <IconShieldCheck size={14} aria-hidden="true" />
            {n.newsletter1PrivacyNote}
          </div>
        )}
      </div>
    </section>
  );
}
