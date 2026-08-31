"use client";

import Image from "next/image";
import {
  IconCamera,
  IconClipboardText,
  IconSend,
  IconWand,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProcessMessages } from "@/types/pages/process/ProcessMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const STEPS = [
  {
    id: "brief",
    icon: IconClipboardText,
    titleKey: "process4Step1Title",
    bodyKey: "process4Step1Body",
    imageAltKey: "process4Step1ImageAlt",
    captionKey: "process4Step1PreviewCaption",
    seed: "process4-brief",
  },
  {
    id: "shoot",
    icon: IconCamera,
    titleKey: "process4Step2Title",
    bodyKey: "process4Step2Body",
    imageAltKey: "process4Step2ImageAlt",
    captionKey: "process4Step2PreviewCaption",
    seed: "process4-shoot",
  },
  {
    id: "edit",
    icon: IconWand,
    titleKey: "process4Step3Title",
    bodyKey: "process4Step3Body",
    imageAltKey: "process4Step3ImageAlt",
    captionKey: "process4Step3PreviewCaption",
    seed: "process4-edit",
  },
  {
    id: "deliver",
    icon: IconSend,
    titleKey: "process4Step4Title",
    bodyKey: "process4Step4Body",
    imageAltKey: "process4Step4ImageAlt",
    captionKey: "process4Step4PreviewCaption",
    seed: "process4-deliver",
  },
] as const;

export function HoverRevealCardsProcess() {
  const t = useMessages("pages") as unknown as PagesWithProcessMessages;
  const p = t.process;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {p.process4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.process4Heading}
          </h2>
          <p className="text-muted">{p.process4Intro}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <HoverCard key={step.id}>
              <HoverCardTrigger asChild>
                <Card variant="interactive" tabIndex={0} className="h-full">
                  <div className="flex flex-col gap-5 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-fg text-4xl font-semibold tracking-tight">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
                        <step.icon size={20} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-fg text-lg font-semibold">
                        {p[step.titleKey]}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {p[step.bodyKey]}
                      </p>
                    </div>
                  </div>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="border-border relative aspect-[4/3] overflow-hidden rounded-lg border">
                  <Image
                    src={placeholderImage(step.seed, "4x3")}
                    alt={p[step.imageAltKey]}
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                </div>
                <p className="text-muted mt-2 text-xs">{p[step.captionKey]}</p>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </section>
  );
}
