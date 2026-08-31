"use client";

import {
  IconBox,
  IconCircleCheck,
  IconClipboardCheck,
  IconTruck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOrderSummaryMessages } from "@/types/pages/order-summary/OrderSummaryMessages-types";

interface TimelineStep {
  id: string;
  labelKey: string;
  icon: Icon;
}

interface OrderSummary4Item {
  id: string;
  nameKey: string;
  qtyKey: string;
  priceKey: string;
}

const STEPS: TimelineStep[] = [
  { id: "placed", labelKey: "orderSummary4Step1Label", icon: IconClipboardCheck },
  { id: "packed", labelKey: "orderSummary4Step2Label", icon: IconBox },
  { id: "shipped", labelKey: "orderSummary4Step3Label", icon: IconTruck },
  { id: "delivered", labelKey: "orderSummary4Step4Label", icon: IconCircleCheck },
];

const CURRENT_STEP = 2;

const ITEMS: OrderSummary4Item[] = [
  {
    id: "boots",
    nameKey: "orderSummary4Item1Name",
    qtyKey: "orderSummary4Item1Qty",
    priceKey: "orderSummary4Item1Price",
  },
  {
    id: "socks",
    nameKey: "orderSummary4Item2Name",
    qtyKey: "orderSummary4Item2Qty",
    priceKey: "orderSummary4Item2Price",
  },
];

export function StatusTimelineOrderSummary() {
  const t = useMessages("pages") as unknown as PagesWithOrderSummaryMessages;
  const os = t.orderSummary;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-xl flex-col px-6 lg:px-8">
        <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <Typography variant="h3">{os.orderSummary4Heading}</Typography>
            <span className="text-muted text-sm">
              {os.orderSummary4DeliveryLabel}{" "}
              <span className="text-fg font-medium">
                {os.orderSummary4DeliveryValue}
              </span>
            </span>
          </div>
          <div className="flex items-center">
            {STEPS.map((step, index) => {
              const isDone = index <= CURRENT_STEP;
              return (
                <div
                  key={step.id}
                  className="flex flex-1 items-center last:flex-none"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border-2",
                        isDone
                          ? "bg-brand border-brand text-brand-fg"
                          : "border-border text-muted bg-bg",
                      )}
                    >
                      <step.icon size={16} aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        "max-w-16 text-center text-xs",
                        isDone ? "text-fg font-medium" : "text-muted",
                      )}
                    >
                      {os[step.labelKey]}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <span
                      className={cn(
                        "mx-1 h-0.5 flex-1",
                        index < CURRENT_STEP ? "bg-brand" : "bg-border",
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-border flex flex-col gap-3 border-t pt-4">
            {ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex flex-col">
                  <span className="text-fg font-medium">
                    {os[item.nameKey]}
                  </span>
                  <span className="text-muted text-xs">
                    {os[item.qtyKey]}
                  </span>
                </div>
                <span className="text-fg">{os[item.priceKey]}</span>
              </div>
            ))}
          </div>
          <div className="border-border flex items-center justify-between border-t pt-3 text-base font-semibold">
            <span className="text-fg">{os.orderSummary4TotalPaidLabel}</span>
            <span className="text-fg">{os.orderSummary4TotalPaidValue}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
