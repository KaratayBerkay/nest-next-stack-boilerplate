"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCardMessages } from "@/types/pages/product-card/ProductCardMessages-types";

interface EditorialItem {
  id: string;
  index: string;
  nameKey: string;
  materialKey: string;
  priceKey: string;
  seed: string;
}

const ITEMS: EditorialItem[] = [
  {
    id: "linen-panel-shirt",
    index: "01",
    nameKey: "productCard6Product1Name",
    materialKey: "productCard6Product1Material",
    priceKey: "productCard6Product1Price",
    seed: "product-card-6-linen-shirt",
  },
  {
    id: "hand-thrown-vase",
    index: "02",
    nameKey: "productCard6Product2Name",
    materialKey: "productCard6Product2Material",
    priceKey: "productCard6Product2Price",
    seed: "product-card-6-ceramic-vase",
  },
  {
    id: "brushed-wool-throw",
    index: "03",
    nameKey: "productCard6Product3Name",
    materialKey: "productCard6Product3Material",
    priceKey: "productCard6Product3Price",
    seed: "product-card-6-wool-throw",
  },
];

export function MinimalEditorialProductCard() {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {p.productCard6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.productCard6Heading}
          </h2>
          <p className="text-muted leading-relaxed">{p.productCard6Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {ITEMS.map((item) => {
            const name = p[item.nameKey];
            return (
              <article key={item.id} className="group flex flex-col gap-3">
                <div className="bg-surface relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={placeholderImage(item.seed, "3x4")}
                    alt={name}
                    fill
                    sizes="(min-width: 640px) 33vw, 90vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <span className="text-muted/70 absolute top-3 left-3 text-xs tracking-widest">
                    {item.index}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-fg text-sm font-medium tracking-tight">
                    {name}
                  </span>
                  <span className="text-muted text-xs">
                    {p[item.materialKey]}
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-fg text-sm">{p[item.priceKey]}</span>
                    <span className="text-muted flex items-center gap-1 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {p.productCard6ViewLabel}
                      <IconArrowUpRight size={13} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
