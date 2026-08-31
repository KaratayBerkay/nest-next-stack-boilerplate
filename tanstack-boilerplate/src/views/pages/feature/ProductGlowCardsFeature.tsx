"use client";

import Image from "next/image";
import { IconStarFilled } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STAR_KEYS = [0, 1, 2, 3, 4] as const;

const PRODUCTS = [
  {
    id: "starter",
    src: "/img/placeholders/ph-4x3-2.webp",
    nameKey: "feature286Product1Name",
    tagKey: "feature286Product1Tag",
    altKey: "feature286Product1ImageAlt",
  },
  {
    id: "growth",
    src: "/img/placeholders/ph-4x3-5.webp",
    nameKey: "feature286Product2Name",
    tagKey: "feature286Product2Tag",
    altKey: "feature286Product2ImageAlt",
  },
  {
    id: "scale",
    src: "/img/placeholders/ph-4x3-7.webp",
    nameKey: "feature286Product3Name",
    tagKey: "feature286Product3Tag",
    altKey: "feature286Product3ImageAlt",
  },
] as const;

export function ProductGlowCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature286Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature286Intro}</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group relative">
              <div className="from-brand/40 to-brand/0 absolute -inset-0.5 rounded-xl bg-gradient-to-br opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
              <div className="border-border bg-surface relative flex flex-col overflow-hidden rounded-xl border">
                <Image
                  src={product.src}
                  alt={f[product.altKey]}
                  width={640}
                  height={480}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="flex flex-col gap-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-fg text-base font-semibold">
                      {f[product.nameKey]}
                    </h3>
                    <Badge>{f[product.tagKey]}</Badge>
                  </div>
                  <span className="flex items-center gap-0.5">
                    {STAR_KEYS.map((star) => (
                      <IconStarFilled
                        key={star}
                        size={14}
                        className="text-brand"
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
