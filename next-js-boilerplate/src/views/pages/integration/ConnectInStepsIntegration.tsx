"use client";

import { useState } from "react";
import {
  IconArrowsExchange,
  IconCircleCheck,
  IconPlug,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/components/ui/step-indicator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIntegrationMessages } from "@/types/pages/integration/IntegrationMessages-types";

interface StepEntry {
  id: string;
  icon: Icon;
  labelKey: string;
  titleKey: string;
  bodyKey: string;
  bulletKeys: [string, string, string];
}

const STEPS: StepEntry[] = [
  {
    id: "step-1",
    icon: IconPlug,
    labelKey: "integration3Step1Label",
    titleKey: "integration3Step1Title",
    bodyKey: "integration3Step1Body",
    bulletKeys: [
      "integration3Step1Bullet1",
      "integration3Step1Bullet2",
      "integration3Step1Bullet3",
    ],
  },
  {
    id: "step-2",
    icon: IconShieldCheck,
    labelKey: "integration3Step2Label",
    titleKey: "integration3Step2Title",
    bodyKey: "integration3Step2Body",
    bulletKeys: [
      "integration3Step2Bullet1",
      "integration3Step2Bullet2",
      "integration3Step2Bullet3",
    ],
  },
  {
    id: "step-3",
    icon: IconArrowsExchange,
    labelKey: "integration3Step3Label",
    titleKey: "integration3Step3Title",
    bodyKey: "integration3Step3Body",
    bulletKeys: [
      "integration3Step3Bullet1",
      "integration3Step3Bullet2",
      "integration3Step3Bullet3",
    ],
  },
];

export function ConnectInStepsIntegration() {
  const t = useMessages("pages") as unknown as PagesWithIntegrationMessages;
  const ig = t.integration;
  const [current, setCurrent] = useState(0);

  const step = STEPS[current];
  const stepLabels = STEPS.map((s) => ig[s.labelKey]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {ig.integration3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {ig.integration3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{ig.integration3Intro}</p>
        </div>

        <div className="mt-10 flex justify-center">
          <StepIndicator
            steps={stepLabels}
            currentStep={current}
            onChange={setCurrent}
          />
        </div>

        <div className="border-border bg-surface mt-8 flex flex-col gap-5 rounded-xl border p-6 sm:p-8">
          <p className="text-muted text-xs font-medium">
            {ig.integration3StepCounterTemplate
              .replace("{step}", String(current + 1))
              .replace("{total}", String(STEPS.length))}
          </p>
          <div className="flex items-start gap-4">
            <span className="border-brand bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-lg border">
              <step.icon size={22} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-fg text-lg font-semibold">
                {ig[step.titleKey]}
              </h3>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {ig[step.bodyKey]}
              </p>
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {step.bulletKeys.map((bulletKey) => (
              <li
                key={bulletKey}
                className="text-fg flex items-start gap-2 text-sm"
              >
                <IconCircleCheck
                  size={16}
                  aria-hidden="true"
                  className="text-success mt-0.5 shrink-0"
                />
                <span>{ig[bulletKey]}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={current === 0}
              onClick={() => setCurrent((prev) => Math.max(0, prev - 1))}
            >
              {ig.integration3PrevLabel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={current === STEPS.length - 1}
              onClick={() =>
                setCurrent((prev) => Math.min(STEPS.length - 1, prev + 1))
              }
            >
              {ig.integration3NextLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
