"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  FeatureMessages,
  PagesWithFeatureMessages,
} from "@/types/pages/feature/FeatureMessages-types";

const LEFT_ITEMS = [
  { titleKey: "feature104Item1Title", bodyKey: "feature104Item1Body" },
  { titleKey: "feature104Item2Title", bodyKey: "feature104Item2Body" },
] as const;

const RIGHT_ITEMS = [
  { titleKey: "feature104Item3Title", bodyKey: "feature104Item3Body" },
  { titleKey: "feature104Item4Title", bodyKey: "feature104Item4Body" },
] as const;

const CENTER_IMAGE_SRC = "/img/placeholders/ph-4x5-3.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 33vw";

function renderItem(
  item: { titleKey: string; bodyKey: string },
  f: FeatureMessages,
) {
  return (
    <div key={item.titleKey} className="flex flex-col items-start gap-3">
      <span
        className="bg-success/10 text-success flex size-12 items-center justify-center rounded-lg"
        aria-hidden="true"
      >
        <IconCheck size={22} />
      </span>
      <h3 className="text-fg text-lg font-semibold">{f[item.titleKey]}</h3>
      <p className="text-muted leading-relaxed">{f[item.bodyKey]}</p>
    </div>
  );
}

export function CenterImageIconHighlightsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto_1fr] lg:gap-16">
          <div className="flex flex-col gap-10 lg:gap-14">
            {LEFT_ITEMS.map((item) => renderItem(item, f))}
          </div>
          <div className="border-border bg-surface mx-auto overflow-hidden rounded-xl border shadow-md">
            <Image
              src={CENTER_IMAGE_SRC}
              alt={f.feature104ImageAlt}
              width={640}
              height={800}
              sizes={IMAGE_SIZES}
              className="aspect-[4/5] w-full max-w-sm object-cover lg:max-w-none"
            />
          </div>
          <div className="flex flex-col gap-10 lg:gap-14">
            {RIGHT_ITEMS.map((item) => renderItem(item, f))}
          </div>
        </div>
      </div>
    </section>
  );
}
