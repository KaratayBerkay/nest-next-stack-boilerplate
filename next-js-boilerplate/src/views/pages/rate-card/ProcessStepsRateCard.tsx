"use client";

import { useState } from "react";
import {
  IconCheck,
  IconClipboardList,
  IconCode,
  IconMessageCircle,
  IconRocket,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithRateCardMessages } from "@/types/pages/rate-card/RateCardMessages-types";

interface RateMode {
  id: "hourly" | "retainer";
  labelKey: string;
  priceKey: string;
  unitKey: string;
  noteKey: string;
}

const RATE_MODES: RateMode[] = [
  {
    id: "hourly",
    labelKey: "rateCard1ModeHourlyLabel",
    priceKey: "rateCard1ModeHourlyPrice",
    unitKey: "rateCard1ModeHourlyUnit",
    noteKey: "rateCard1ModeHourlyNote",
  },
  {
    id: "retainer",
    labelKey: "rateCard1ModeRetainerLabel",
    priceKey: "rateCard1ModeRetainerPrice",
    unitKey: "rateCard1ModeRetainerUnit",
    noteKey: "rateCard1ModeRetainerNote",
  },
];

const INCLUDED_KEYS = [
  "rateCard1Include1",
  "rateCard1Include2",
  "rateCard1Include3",
] as const;

interface ProcessStep {
  id: string;
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "discovery",
    icon: IconMessageCircle,
    titleKey: "rateCard1Step1Title",
    descriptionKey: "rateCard1Step1Description",
  },
  {
    id: "scope",
    icon: IconClipboardList,
    titleKey: "rateCard1Step2Title",
    descriptionKey: "rateCard1Step2Description",
  },
  {
    id: "build",
    icon: IconCode,
    titleKey: "rateCard1Step3Title",
    descriptionKey: "rateCard1Step3Description",
  },
  {
    id: "launch",
    icon: IconRocket,
    titleKey: "rateCard1Step4Title",
    descriptionKey: "rateCard1Step4Description",
  },
];

export function ProcessStepsRateCard() {
  const t = useMessages("pages") as unknown as PagesWithRateCardMessages;
  const r = t.rateCard;
  const [modeId, setModeId] = useState<RateMode["id"]>("hourly");
  const activeMode =
    RATE_MODES.find((mode) => mode.id === modeId) ?? RATE_MODES[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {r.rateCard1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
            {r.rateCard1Heading}
          </h2>
          <p className="text-muted text-base leading-relaxed">
            {r.rateCard1Subheading}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5 lg:items-start">
          <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 lg:col-span-2 lg:p-8">
            <ToggleGroup
              type="single"
              value={modeId}
              onValueChange={(value) => {
                if (value) setModeId(value as RateMode["id"]);
              }}
              aria-label={r.rateCard1ToggleAria}
              className="self-start"
            >
              {RATE_MODES.map((mode) => (
                <ToggleGroupItem key={mode.id} value={mode.id} size="sm">
                  {r[mode.labelKey]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs font-medium tracking-wider uppercase">
                {r.rateCard1RateLabel}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-fg text-4xl font-semibold tracking-tight">
                  {r[activeMode.priceKey]}
                </span>
                <span className="text-muted text-base">
                  {r[activeMode.unitKey]}
                </span>
              </div>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {r[activeMode.noteKey]}
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {INCLUDED_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-2.5">
                  <IconCheck
                    size={16}
                    className="text-brand shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-fg text-sm">{r[key]}</span>
                </li>
              ))}
            </ul>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mt-auto w-full"
            >
              {r.rateCard1Cta}
            </Button>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-fg text-lg font-semibold tracking-tight">
              {r.rateCard1ProcessHeading}
            </h3>
            <ol className="mt-6 flex flex-col gap-8">
              {PROCESS_STEPS.map((step, index) => (
                <li
                  key={step.id}
                  className={cn(
                    "relative pl-12",
                    index !== PROCESS_STEPS.length - 1 &&
                      "border-border border-l",
                  )}
                >
                  <span
                    className="bg-brand text-brand-fg absolute top-0 -left-5 flex size-10 shrink-0 items-center justify-center rounded-full"
                    aria-hidden="true"
                  >
                    <step.icon size={18} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1 pt-1.5">
                    <span className="text-fg text-sm font-semibold">
                      {r[step.titleKey]}
                    </span>
                    <span className="text-muted text-sm leading-relaxed">
                      {r[step.descriptionKey]}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
