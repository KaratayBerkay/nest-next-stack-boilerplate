"use client";

import Image from "next/image";
import { useState } from "react";
import { IconCheck, IconCrown } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
import type { PagesWithOfferModalMessages } from "@/types/pages/offer-modal/OfferModalMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const PHOTO_SEED = "offer-modal-4-membership" as const;

interface Perk {
  id: string;
  labelKey: "offerModal4Perk1" | "offerModal4Perk2" | "offerModal4Perk3";
}

const PERKS: Perk[] = [
  { id: "perk-1", labelKey: "offerModal4Perk1" },
  { id: "perk-2", labelKey: "offerModal4Perk2" },
  { id: "perk-3", labelKey: "offerModal4Perk3" },
];

export function MembershipPhotoOfferModal() {
  const t = useMessages("pages") as unknown as PagesWithOfferModalMessages;
  const o = t.offerModal;
  const [joined, setJoined] = useState(false);

  return (
    <section className="flex w-full items-center justify-center py-16 lg:py-24">
      <Dialog>
        <DialogTrigger variant="primary" className="gap-2">
          <IconCrown size={18} aria-hidden="true" />
          {o.offerModal4Trigger}
        </DialogTrigger>
        <DialogContent size="md">
          <div className="relative aspect-[16/9] shrink-0 overflow-hidden">
            <Image
              src={placeholderImage(PHOTO_SEED, "16x9")}
              alt={o.offerModal4ImageAlt}
              fill
              sizes="(min-width: 640px) 512px, 100vw"
              className="object-cover"
            />
            <Badge
              variant="default"
              size="sm"
              className="absolute top-4 left-4 inline-flex items-center gap-1.5"
            >
              <IconCrown size={14} aria-hidden="true" />
              {o.offerModal4Badge}
            </Badge>
          </div>
          <DialogHeader>
            <DialogTitle>{o.offerModal4Heading}</DialogTitle>
            <DialogDescription>{o.offerModal4Description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 px-6 pb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-fg text-3xl font-semibold tracking-tight">
                {o.offerModal4Price}
              </span>
              <span className="text-muted text-sm">
                {o.offerModal4PricePeriod}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {PERKS.map((perk) => (
                <li key={perk.id} className="flex items-center gap-2">
                  <IconCheck
                    size={16}
                    className="text-brand shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-fg text-sm">{o[perk.labelKey]}</span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <DialogClose variant="ghost">{o.offerModal4Dismiss}</DialogClose>
            {joined ? (
              <span
                role="status"
                className="text-brand inline-flex items-center gap-1.5 text-sm font-medium"
              >
                <IconCheck size={16} aria-hidden="true" />
                {o.offerModal4Success}
              </span>
            ) : (
              <Button variant="primary" onClick={() => setJoined(true)}>
                {o.offerModal4Cta}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
