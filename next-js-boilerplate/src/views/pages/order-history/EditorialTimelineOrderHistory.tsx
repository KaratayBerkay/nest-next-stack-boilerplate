"use client";

import Image from "next/image";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOrderHistoryMessages } from "@/types/pages/order-history/OrderHistoryMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type OrderHistoryMessages = PagesWithOrderHistoryMessages["orderHistory"];

interface EntryRef {
  numberKey: string;
  dateKey: string;
  titleKey: string;
  blurbKey: string;
  seed: string;
  currentStep: number;
}

interface Entry {
  id: string;
  number: string;
  date: string;
  title: string;
  blurb: string;
  seed: string;
  currentStep: number;
}

const ENTRY_REFS: EntryRef[] = [
  {
    numberKey: "orderHistory4Entry1Number",
    dateKey: "orderHistory4Entry1Date",
    titleKey: "orderHistory4Entry1Title",
    blurbKey: "orderHistory4Entry1Blurb",
    seed: "oh4-1",
    currentStep: 1,
  },
  {
    numberKey: "orderHistory4Entry2Number",
    dateKey: "orderHistory4Entry2Date",
    titleKey: "orderHistory4Entry2Title",
    blurbKey: "orderHistory4Entry2Blurb",
    seed: "oh4-2",
    currentStep: 2,
  },
  {
    numberKey: "orderHistory4Entry3Number",
    dateKey: "orderHistory4Entry3Date",
    titleKey: "orderHistory4Entry3Title",
    blurbKey: "orderHistory4Entry3Blurb",
    seed: "oh4-3",
    currentStep: 2,
  },
  {
    numberKey: "orderHistory4Entry4Number",
    dateKey: "orderHistory4Entry4Date",
    titleKey: "orderHistory4Entry4Title",
    blurbKey: "orderHistory4Entry4Blurb",
    seed: "oh4-4",
    currentStep: 2,
  },
];

function buildEntries(d: OrderHistoryMessages): Entry[] {
  return ENTRY_REFS.map((ref) => ({
    id: ref.numberKey,
    number: d[ref.numberKey],
    date: d[ref.dateKey],
    title: d[ref.titleKey],
    blurb: d[ref.blurbKey],
    seed: ref.seed,
    currentStep: ref.currentStep,
  }));
}

export function EditorialTimelineOrderHistory() {
  const t = useMessages("pages") as unknown as PagesWithOrderHistoryMessages;
  const d = t.orderHistory;
  const entries = buildEntries(d);
  const steps = [
    d.orderHistory4StepPlaced,
    d.orderHistory4StepShipped,
    d.orderHistory4StepDelivered,
  ];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.orderHistory4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.orderHistory4Description}
          </Typography>
        </div>

        <div className="relative flex flex-col gap-10">
          <span
            aria-hidden="true"
            className="bg-border absolute top-2 bottom-2 left-4 w-px"
          />
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="relative flex flex-col gap-4 pl-10 sm:flex-row sm:items-start sm:gap-6"
            >
              <span
                aria-hidden="true"
                className="border-bg bg-brand absolute top-1.5 left-2.5 size-3 rounded-full border-2"
              />
              <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl sm:w-40">
                <Image
                  src={placeholderImage(entry.seed, "4x5")}
                  alt={d.orderHistory4ImageAlt}
                  fill
                  sizes="(min-width: 640px) 160px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <span className="text-muted text-xs font-medium tracking-wider uppercase">
                  {entry.date} · {entry.number}
                </span>
                <Typography variant="h4">{entry.title}</Typography>
                <p className="text-muted text-sm">{entry.blurb}</p>
                <div className="pt-2">
                  <StepIndicator
                    steps={steps}
                    currentStep={entry.currentStep}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
