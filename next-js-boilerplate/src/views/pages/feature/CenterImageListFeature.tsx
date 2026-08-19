"use client";

import Image from "next/image";
import {
  IconBolt,
  IconChartBar,
  IconGlobe,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  FeatureMessages,
  PagesWithFeatureMessages,
} from "@/types/pages/feature/FeatureMessages-types";

interface ColumnItem {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const LEFT_ITEMS: ColumnItem[] = [
  {
    id: "releases",
    icon: IconBolt,
    titleKey: "feature245Item1Title",
    bodyKey: "feature245Item1Body",
  },
  {
    id: "security",
    icon: IconShieldCheck,
    titleKey: "feature245Item2Title",
    bodyKey: "feature245Item2Body",
  },
];

const RIGHT_ITEMS: ColumnItem[] = [
  {
    id: "data",
    icon: IconChartBar,
    titleKey: "feature245Item3Title",
    bodyKey: "feature245Item3Body",
  },
  {
    id: "integrations",
    icon: IconGlobe,
    titleKey: "feature245Item4Title",
    bodyKey: "feature245Item4Body",
  },
];

function FeatureListItem({
  item,
  f,
}: {
  item: ColumnItem;
  f: FeatureMessages;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="bg-brand/10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-md">
        <item.icon size={20} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-fg text-base font-semibold">{f[item.titleKey]}</h3>
        <p className="text-muted text-sm leading-relaxed">{f[item.bodyKey]}</p>
      </div>
    </div>
  );
}

const IMAGE_SRC =
  "https://picsum.photos/seed/feature245-center/600/800" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 320px";

export function CenterImageListFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature245Heading}
          </h2>
          <p className="text-muted max-w-xl leading-relaxed">
            {f.feature245Paragraph}
          </p>
        </div>
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-10">
            {LEFT_ITEMS.map((item) => (
              <FeatureListItem key={item.id} item={item} f={f} />
            ))}
          </div>
          <div className="border-border bg-surface order-first overflow-hidden rounded-xl border shadow-md lg:order-none">
            <Image
              src={IMAGE_SRC}
              alt={f.feature245ImageAlt}
              width={600}
              height={800}
              sizes={IMAGE_SIZES}
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-10">
            {RIGHT_ITEMS.map((item) => (
              <FeatureListItem key={item.id} item={item} f={f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
