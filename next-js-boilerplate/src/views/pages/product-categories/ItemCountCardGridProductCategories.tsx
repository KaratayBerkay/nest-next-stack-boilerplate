"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IconArmchair,
  IconArrowRight,
  IconBallFootball,
  IconBook2,
  IconDeviceLaptop,
  IconShirt,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCategoriesMessages } from "@/types/pages/product-categories/ProductCategoriesMessages-types";

interface CategoryCard {
  id: string;
  nameKey: string;
  icon: typeof IconDeviceLaptop;
  count: number;
  seed: string;
  trending?: boolean;
}

const CATEGORIES: CategoryCard[] = [
  {
    id: "electronics",
    nameKey: "productCategories1Item1Name",
    icon: IconDeviceLaptop,
    count: 1284,
    seed: "pc1-electronics",
  },
  {
    id: "fashion",
    nameKey: "productCategories1Item2Name",
    icon: IconShirt,
    count: 3920,
    seed: "pc1-fashion",
    trending: true,
  },
  {
    id: "home",
    nameKey: "productCategories1Item3Name",
    icon: IconArmchair,
    count: 872,
    seed: "pc1-home",
  },
  {
    id: "beauty",
    nameKey: "productCategories1Item4Name",
    icon: IconSparkles,
    count: 640,
    seed: "pc1-beauty",
  },
  {
    id: "sports",
    nameKey: "productCategories1Item5Name",
    icon: IconBallFootball,
    count: 1105,
    seed: "pc1-sports",
  },
  {
    id: "books",
    nameKey: "productCategories1Item6Name",
    icon: IconBook2,
    count: 2430,
    seed: "pc1-books",
  },
];

export function ItemCountCardGridProductCategories() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithProductCategoriesMessages;
  const pc = t.productCategories;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex max-w-xl flex-col gap-3">
            <span className="text-brand text-xs font-semibold tracking-wide uppercase">
              {pc.productCategories1Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {pc.productCategories1Heading}
            </h2>
            <p className="text-muted">{pc.productCategories1Description}</p>
          </div>
          <Link
            href="#"
            className="text-fg hover:text-brand inline-flex shrink-0 items-center gap-1 text-sm font-medium"
          >
            {pc.productCategories1ViewAllLabel}
            <IconArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const name = pc[category.nameKey];
            return (
              <div
                key={category.id}
                className="border-border bg-surface group flex flex-col overflow-hidden rounded-2xl border"
              >
                <div className="bg-surface-hover relative aspect-[3/2] w-full overflow-hidden">
                  <Image
                    src={placeholderImage(category.seed, "3x2")}
                    alt={name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {category.trending && (
                    <Badge
                      variant="soft"
                      size="sm"
                      pill
                      className="absolute top-3 left-3"
                    >
                      {pc.productCategories1TrendingBadge}
                    </Badge>
                  )}
                  <span className="bg-bg/90 text-fg absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full">
                    <category.icon size={16} aria-hidden="true" />
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-between gap-3 p-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-fg text-base font-medium">
                      {name}
                    </span>
                    <span className="text-muted text-sm">
                      {category.count} {pc.productCategories1ProductsSuffix}
                    </span>
                  </div>
                  <Link
                    href="#"
                    aria-label={`${pc.productCategories1CtaLabel} ${name}`}
                    className="text-muted group-hover:text-brand group-hover:bg-brand/10 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
                  >
                    <IconArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
