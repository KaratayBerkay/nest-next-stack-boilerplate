"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconBallFootball,
  IconBook2,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceGamepad2,
  IconDeviceLaptop,
  IconFridge,
  IconHanger,
  IconPaw,
  IconSparkles,
} from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCategoriesMessages } from "@/types/pages/product-categories/ProductCategoriesMessages-types";

interface ScrollCategory {
  id: string;
  nameKey: string;
  icon: typeof IconDeviceLaptop;
  count: number;
  seed: string;
}

const CATEGORIES: ScrollCategory[] = [
  { id: "electronics", nameKey: "productCategories4Item1Name", icon: IconDeviceLaptop, count: 1284, seed: "pc4-electronics" },
  { id: "fashion", nameKey: "productCategories4Item2Name", icon: IconHanger, count: 3920, seed: "pc4-fashion" },
  { id: "home", nameKey: "productCategories4Item3Name", icon: IconFridge, count: 1560, seed: "pc4-home" },
  { id: "beauty", nameKey: "productCategories4Item4Name", icon: IconSparkles, count: 640, seed: "pc4-beauty" },
  { id: "sports", nameKey: "productCategories4Item5Name", icon: IconBallFootball, count: 1105, seed: "pc4-sports" },
  { id: "toys", nameKey: "productCategories4Item6Name", icon: IconDeviceGamepad2, count: 480, seed: "pc4-toys" },
  { id: "books", nameKey: "productCategories4Item7Name", icon: IconBook2, count: 2430, seed: "pc4-books" },
  { id: "pets", nameKey: "productCategories4Item8Name", icon: IconPaw, count: 315, seed: "pc4-pets" },
];

export function HorizontalPromoScrollProductCategories() {
  const t = useMessages("pages") as unknown as PagesWithProductCategoriesMessages;
  const pc = t.productCategories;
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 260, behavior: "smooth" });
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex max-w-xl flex-col gap-3">
            <span className="text-brand text-xs font-semibold tracking-wide uppercase">
              {pc.productCategories4Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {pc.productCategories4Heading}
            </h2>
            <p className="text-muted">{pc.productCategories4Description}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <IconButton
              icon={<IconChevronLeft size={18} aria-hidden="true" />}
              label={pc.productCategories4PrevAria}
              variant="outline"
              size="icon"
              onClick={() => scrollByAmount(-1)}
            />
            <IconButton
              icon={<IconChevronRight size={18} aria-hidden="true" />}
              label={pc.productCategories4NextAria}
              variant="outline"
              size="icon"
              onClick={() => scrollByAmount(1)}
            />
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {CATEGORIES.map((category) => {
            const name = pc[category.nameKey];
            return (
              <Link
                key={category.id}
                href="#"
                className="group border-border bg-surface flex w-40 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border sm:w-48"
              >
                <div className="bg-surface-hover relative aspect-square w-full overflow-hidden">
                  <Image
                    src={placeholderImage(category.seed, "1x1")}
                    alt={name}
                    fill
                    sizes="192px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="bg-bg/90 text-fg absolute top-2 left-2 flex size-8 items-center justify-center rounded-full">
                    <category.icon size={14} aria-hidden="true" />
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-3">
                  <span className="text-fg text-sm font-medium">{name}</span>
                  <span className="text-muted text-xs">
                    {category.count} {pc.productCategories4ProductsSuffix}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
