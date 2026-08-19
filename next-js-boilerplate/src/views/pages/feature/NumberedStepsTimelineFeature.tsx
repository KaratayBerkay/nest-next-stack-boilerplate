"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STEPS = [
  {
    number: 1,
    reverse: false,
    titleKey: "feature102Step1Title",
    bodyKey: "feature102Step1Body",
    altKey: "feature102Step1ImageAlt",
    src: "https://picsum.photos/seed/feature102-1/640/400",
  },
  {
    number: 2,
    reverse: true,
    titleKey: "feature102Step2Title",
    bodyKey: "feature102Step2Body",
    altKey: "feature102Step2ImageAlt",
    src: "https://picsum.photos/seed/feature102-2/640/400",
  },
  {
    number: 3,
    reverse: false,
    titleKey: "feature102Step3Title",
    bodyKey: "feature102Step3Body",
    altKey: "feature102Step3ImageAlt",
    src: "https://picsum.photos/seed/feature102-3/640/400",
  },
] as const;

export function NumberedStepsTimelineFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature102Heading}
          </h2>
          <p className="text-muted">{f.feature102Intro}</p>
        </div>
        <div className="mt-14 flex flex-col gap-14">
          {STEPS.map((step) => (
            <div
              key={step.titleKey}
              className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12 ${
                step.reverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex flex-1 flex-col items-start gap-4 lg:max-w-md">
                <span className="bg-brand text-brand-fg flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {String(step.number).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-fg text-xl font-semibold">
                    {f[step.titleKey]}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {f[step.bodyKey]}
                  </p>
                </div>
              </div>
              <div className="border-border bg-surface flex-1 overflow-hidden rounded-lg border">
                <Image
                  src={step.src}
                  alt={f[step.altKey]}
                  width={640}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
