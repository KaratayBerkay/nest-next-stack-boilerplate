"use client";

import {
  IconClipboardCheck,
  IconMessages,
  IconSend,
  IconUserCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProcessMessages } from "@/types/pages/process/ProcessMessages-types";

const STEPS = [
  {
    id: "submit",
    icon: IconSend,
    titleKey: "process3Step1Title",
    bodyKey: "process3Step1Body",
    tagKey: "process3Step1Tag",
    accent: "brand",
  },
  {
    id: "screen",
    icon: IconClipboardCheck,
    titleKey: "process3Step2Title",
    bodyKey: "process3Step2Body",
    tagKey: "process3Step2Tag",
    accent: "info",
  },
  {
    id: "interview",
    icon: IconMessages,
    titleKey: "process3Step3Title",
    bodyKey: "process3Step3Body",
    tagKey: "process3Step3Tag",
    accent: "success",
  },
  {
    id: "decision",
    icon: IconUserCheck,
    titleKey: "process3Step4Title",
    bodyKey: "process3Step4Body",
    tagKey: "process3Step4Tag",
    accent: "warning",
  },
] as const;

const ACCENT_CLASSES = {
  brand: {
    band: "bg-brand/5",
    ring: "bg-brand text-brand-fg",
    text: "text-brand",
    border: "border-brand/30",
  },
  info: {
    band: "bg-info/5",
    ring: "bg-info text-info-fg",
    text: "text-info",
    border: "border-info/30",
  },
  success: {
    band: "bg-success/5",
    ring: "bg-success text-success-fg",
    text: "text-success",
    border: "border-success/30",
  },
  warning: {
    band: "bg-warning/5",
    ring: "bg-warning text-warning-fg",
    text: "text-warning",
    border: "border-warning/30",
  },
} as const;

export function ColorBandedTimelineProcess() {
  const t = useMessages("pages") as unknown as PagesWithProcessMessages;
  const p = t.process;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {p.process3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.process3Heading}
          </h2>
          <p className="text-muted">{p.process3Intro}</p>
        </div>

        <ol className="mt-12 flex flex-col">
          {STEPS.map((step, index) => {
            const accent = ACCENT_CLASSES[step.accent];
            const isLast = index === STEPS.length - 1;
            return (
              <li key={step.id} className="flex gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      accent.ring,
                    )}
                  >
                    {index + 1}
                  </span>
                  {!isLast && (
                    <span
                      className="bg-border my-1 w-px flex-1"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-xl border p-5 sm:p-6",
                    !isLast && "mb-4",
                    accent.band,
                    accent.border,
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <step.icon
                        size={18}
                        className={accent.text}
                        aria-hidden="true"
                      />
                      <h3 className="text-fg text-lg font-semibold">
                        {p[step.titleKey]}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-semibold",
                        accent.text,
                        accent.border,
                      )}
                    >
                      {p[step.tagKey]}
                    </span>
                  </div>
                  <p className="text-muted mt-2 text-sm leading-relaxed">
                    {p[step.bodyKey]}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
