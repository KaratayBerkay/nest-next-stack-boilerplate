"use client";

import Image from "next/image";
import { IconCircleCheckFilled, IconReceipt2 } from "@tabler/icons-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOrderSummaryMessages } from "@/types/pages/order-summary/OrderSummaryMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface OrderSummary6Item {
  id: string;
  nameKey: string;
  priceKey: string;
  imageSeed: string;
}

const ITEMS: OrderSummary6Item[] = [
  {
    id: "headphones",
    nameKey: "orderSummary6Item1Name",
    priceKey: "orderSummary6Item1Price",
    imageSeed: "order-summary6-headphones",
  },
  {
    id: "case",
    nameKey: "orderSummary6Item2Name",
    priceKey: "orderSummary6Item2Price",
    imageSeed: "order-summary6-case",
  },
  {
    id: "cable",
    nameKey: "orderSummary6Item3Name",
    priceKey: "orderSummary6Item3Price",
    imageSeed: "order-summary6-cable",
  },
];

export function ConfirmationDialogOrderSummary() {
  const t = useMessages("pages") as unknown as PagesWithOrderSummaryMessages;
  const os = t.orderSummary;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Dialog>
          <DialogTrigger
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            <IconReceipt2 size={18} aria-hidden="true" />
            {os.orderSummary6TriggerLabel}
          </DialogTrigger>
          <DialogContent size="sm">
            <div className="flex flex-col items-center gap-2 px-6 pt-8 text-center">
              <IconCircleCheckFilled
                className="text-success size-10"
                aria-hidden="true"
              />
              <DialogTitle>{os.orderSummary6Heading}</DialogTitle>
              <span className="text-muted text-sm">
                {os.orderSummary6OrderLabel} {os.orderSummary6OrderNumber} ·{" "}
                {os.orderSummary6DateValue}
              </span>
            </div>
            <DialogBody className="flex flex-col gap-3">
              {ITEMS.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="bg-surface-hover relative size-10 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={placeholderImage(item.imageSeed, "1x1")}
                      alt={os[item.nameKey]}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-fg flex-1 text-sm font-medium">
                    {os[item.nameKey]}
                  </span>
                  <span className="text-muted text-sm">
                    {os[item.priceKey]}
                  </span>
                </div>
              ))}
              <div className="border-border flex items-center justify-between border-t pt-3 text-base font-semibold">
                <span className="text-fg">{os.orderSummary6TotalLabel}</span>
                <span className="text-fg">{os.orderSummary6TotalValue}</span>
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose variant="ghost">
                {os.orderSummary6SecondaryCta}
              </DialogClose>
              <DialogClose variant="primary">
                {os.orderSummary6PrimaryCta}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
