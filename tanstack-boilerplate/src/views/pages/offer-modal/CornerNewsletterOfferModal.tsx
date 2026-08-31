"use client";

import { useState } from "react";
import { IconCircleCheck, IconDiscount2, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOfferModalMessages } from "@/types/pages/offer-modal/OfferModalMessages-types";

export function CornerNewsletterOfferModal() {
  const t = useMessages("pages") as unknown as PagesWithOfferModalMessages;
  const o = t.offerModal;
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-end overflow-hidden rounded-2xl border p-6">
      {dismissed ? (
        <Button variant="outline" size="sm" onClick={() => setDismissed(false)}>
          {o.offerModal1Reopen}
        </Button>
      ) : (
        <div className="border-border bg-bg animate-fade-in-up relative flex w-full max-w-sm flex-col gap-4 rounded-2xl border p-5 shadow-lg motion-reduce:animate-none">
          <IconButton
            variant="ghost"
            size="icon-sm"
            label={o.offerModal1CloseAria}
            icon={<IconX size={16} aria-hidden="true" />}
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3"
          />
          <Badge
            variant="soft"
            pill
            className="inline-flex w-fit items-center gap-1.5"
          >
            <IconDiscount2 size={14} aria-hidden="true" />
            {o.offerModal1Eyebrow}
          </Badge>
          <div className="flex flex-col gap-1 pr-6">
            <h3 className="text-fg text-lg font-semibold tracking-tight">
              {o.offerModal1Heading}
            </h3>
            <p className="text-muted text-sm">{o.offerModal1Body}</p>
          </div>
          {submitted ? (
            <p
              role="status"
              className="text-brand flex items-center gap-1.5 text-sm font-medium"
            >
              <IconCircleCheck size={16} aria-hidden="true" />
              {o.offerModal1Success}
            </p>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
              className="flex flex-col gap-2"
            >
              <Input
                type="email"
                required
                aria-label={o.offerModal1EmailAria}
                placeholder={o.offerModal1EmailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button type="submit" variant="primary" className="w-full">
                {o.offerModal1Submit}
              </Button>
            </form>
          )}
          <p className="text-muted text-xs">{o.offerModal1FinePrint}</p>
        </div>
      )}
    </section>
  );
}
