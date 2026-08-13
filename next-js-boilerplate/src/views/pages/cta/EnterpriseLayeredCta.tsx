"use client";

import Image from "next/image";
import {
  IconArrowRight,
  IconChartBar,
  IconHeadphones,
  IconLock,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const MAIN_IMAGE_SRC =
  "https://picsum.photos/seed/cta28-main/800/1000" as const;
const LAYER_IMAGE_SRC =
  "https://picsum.photos/seed/cta28-layer/800/1000" as const;

const FEATURES: { icon: Icon; labelKey: string }[] = [
  { icon: IconShieldCheck, labelKey: "cta28Feature1Label" },
  { icon: IconChartBar, labelKey: "cta28Feature2Label" },
  { icon: IconHeadphones, labelKey: "cta28Feature3Label" },
  { icon: IconLock, labelKey: "cta28Feature4Label" },
];

export function EnterpriseLayeredCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="bg-brand rounded-3xl p-8 shadow-xs lg:p-12">
          <div className="grid gap-10 xl:grid-cols-2 xl:items-center">
            <div className="flex flex-col items-start gap-6">
              <Typography
                variant="h2"
                className="text-brand-fg text-4xl font-medium tracking-tighter md:text-5xl xl:text-6xl"
              >
                {co.cta28Title}
              </Typography>
              <Typography
                variant="bodyLarge"
                className="text-brand-fg/80 max-w-xl"
              >
                {co.cta28Body}
              </Typography>
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.labelKey}
                    className="flex items-center gap-3"
                  >
                    <span className="bg-surface/10 text-brand-fg flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <feature.icon size={18} aria-hidden="true" />
                    </span>
                    <span className="text-brand-fg text-sm font-medium">
                      {co[feature.labelKey]}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                asChild
                variant="default"
                size="lg"
                className="w-full !rounded-full sm:w-auto"
                rightIcon={<IconArrowRight size={16} aria-hidden="true" />}
              >
                <a href={LINK_URL}>{co.cta28PrimaryButton}</a>
              </Button>
            </div>
            <div className="relative hidden min-h-[440px] xl:block">
              <Image
                src={MAIN_IMAGE_SRC}
                alt={co.cta28ImageAlt}
                width={500}
                height={625}
                className="absolute top-0 left-0 aspect-[4/5] w-[62%] rounded-2xl object-cover shadow-lg"
              />
              <Image
                src={LAYER_IMAGE_SRC}
                alt={co.cta28LayerImageAlt}
                width={384}
                height={480}
                className="absolute right-0 bottom-0 aspect-[4/5] w-[48%] rounded-2xl object-cover opacity-90 shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
