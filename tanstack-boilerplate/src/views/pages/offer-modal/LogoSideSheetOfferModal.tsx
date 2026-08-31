"use client";

import { useState } from "react";
import { IconBolt, IconCheck, IconCopy, IconSparkles } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/Sheet";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOfferModalMessages } from "@/types/pages/offer-modal/OfferModalMessages-types";

interface Perk {
  id: string;
  labelKey: "offerModal5Perk1" | "offerModal5Perk2" | "offerModal5Perk3";
}

const PERKS: Perk[] = [
  { id: "perk-1", labelKey: "offerModal5Perk1" },
  { id: "perk-2", labelKey: "offerModal5Perk2" },
  { id: "perk-3", labelKey: "offerModal5Perk3" },
];

export function LogoSideSheetOfferModal() {
  const t = useMessages("pages") as unknown as PagesWithOfferModalMessages;
  const o = t.offerModal;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(o.offerModal5CodeValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions, insecure context) — the code is
      // still visible in the panel for the user to select and copy by hand.
    }
  };

  return (
    <section className="flex w-full items-center justify-center py-16 lg:py-24">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            leftIcon={<IconSparkles size={18} aria-hidden="true" />}
          >
            {o.offerModal5Trigger}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center gap-2.5">
            <span className="bg-brand text-brand-fg flex size-9 shrink-0 items-center justify-center rounded-lg">
              <IconBolt size={18} aria-hidden="true" />
            </span>
            <span className="text-fg text-sm font-semibold tracking-tight">
              {o.offerModal5LogoWordmark}
            </span>
          </div>
          <Badge variant="soft" pill className="w-fit">
            {o.offerModal5Eyebrow}
          </Badge>
          <SheetHeader className="text-left">
            <SheetTitle>{o.offerModal5Heading}</SheetTitle>
            <SheetDescription>{o.offerModal5Description}</SheetDescription>
          </SheetHeader>
          <ul className="flex flex-col gap-2.5">
            {PERKS.map((perk) => (
              <li key={perk.id} className="flex items-start gap-2.5">
                <IconCheck
                  size={16}
                  className="text-brand mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-fg text-sm">{o[perk.labelKey]}</span>
              </li>
            ))}
          </ul>
          <div className="border-border bg-surface flex items-center gap-3 rounded-xl border p-1.5 pl-3 shadow-xs">
            <span className="text-muted shrink-0 text-xs font-medium">
              {o.offerModal5CodeLabel}
            </span>
            <code className="text-brand font-mono text-sm font-semibold tracking-wide">
              {o.offerModal5CodeValue}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto shrink-0"
              aria-label={o.offerModal5CopyAria}
              onClick={handleCopy}
              leftIcon={
                copied ? (
                  <IconCheck size={14} aria-hidden="true" />
                ) : (
                  <IconCopy size={14} aria-hidden="true" />
                )
              }
            >
              {copied ? o.offerModal5Copied : o.offerModal5Copy}
            </Button>
          </div>
          <p className="text-muted text-xs">{o.offerModal5Expiry}</p>
        </SheetContent>
      </Sheet>
    </section>
  );
}
