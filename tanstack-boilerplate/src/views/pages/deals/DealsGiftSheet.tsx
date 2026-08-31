"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  IconCheck,
  IconCopy,
  IconGift,
  IconPackage,
  IconReceipt2,
  IconTicket,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
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
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDealsMessages } from "@/types/pages/deals/DealsMessages-types";

interface DealRow {
  id: string;
  icon: Icon;
  nameKey: string;
  descKey: string;
  discountKey: string;
}

const DEAL_ROWS: DealRow[] = [
  {
    id: "early-bird",
    icon: IconTicket,
    nameKey: "deals1Deal1Name",
    descKey: "deals1Deal1Desc",
    discountKey: "deals1Deal1Discount",
  },
  {
    id: "free-shipping",
    icon: IconPackage,
    nameKey: "deals1Deal2Name",
    descKey: "deals1Deal2Desc",
    discountKey: "deals1Deal2Discount",
  },
  {
    id: "bundle-bonus",
    icon: IconReceipt2,
    nameKey: "deals1Deal3Name",
    descKey: "deals1Deal3Desc",
    discountKey: "deals1Deal3Discount",
  },
  {
    id: "refer-a-friend",
    icon: IconWallet,
    nameKey: "deals1Deal4Name",
    descKey: "deals1Deal4Desc",
    discountKey: "deals1Deal4Discount",
  },
];

function handleCopy(
  code: string,
  setCopied: Dispatch<SetStateAction<boolean>>,
) {
  navigator.clipboard.writeText(code);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

export function DealsGiftSheet() {
  const t = useMessages("pages") as unknown as PagesWithDealsMessages;
  const d = t.deals;
  const [copied, setCopied] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              aria-label={d.deals1TriggerAria}
              leftIcon={<IconGift size={18} aria-hidden="true" />}
            >
              {d.deals1Trigger}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex flex-col gap-6 overflow-y-auto"
          >
            <SheetHeader className="text-left">
              <SheetTitle>{d.deals1Heading}</SheetTitle>
              <SheetDescription>{d.deals1Description}</SheetDescription>
            </SheetHeader>
            <ul className="flex flex-col">
              {DEAL_ROWS.map((row) => (
                <li
                  key={row.id}
                  className="border-border flex items-center gap-3 border-b py-3 last:border-b-0"
                >
                  <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
                    <row.icon size={20} aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {d[row.nameKey]}
                    </span>
                    <span className="text-muted text-xs">{d[row.descKey]}</span>
                  </div>
                  <Badge variant="soft" pill>
                    {d[row.discountKey]}
                  </Badge>
                </li>
              ))}
            </ul>
            <div className="border-border bg-surface flex items-center gap-3 rounded-xl border p-1.5 pl-3 shadow-xs">
              <span className="text-muted shrink-0 text-xs font-medium">
                {d.deals1CodeLabel}
              </span>
              <code className="text-brand font-mono text-sm font-semibold tracking-wide">
                {d.deals1CodeValue}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto shrink-0"
                aria-label={d.deals1CopyAria}
                onClick={() => handleCopy(d.deals1CodeValue, setCopied)}
                leftIcon={
                  copied ? (
                    <IconCheck size={14} aria-hidden="true" />
                  ) : (
                    <IconCopy size={14} aria-hidden="true" />
                  )
                }
              >
                {copied ? d.deals1Copied : d.deals1Copy}
              </Button>
            </div>
            <Typography variant="caption">{d.deals1Footnote}</Typography>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
