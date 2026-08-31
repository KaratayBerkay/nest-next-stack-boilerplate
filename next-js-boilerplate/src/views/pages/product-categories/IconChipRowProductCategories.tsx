"use client";

import { useState } from "react";
import {
  IconBabyCarriage,
  IconBallFootball,
  IconBook2,
  IconDeviceGamepad2,
  IconDeviceLaptop,
  IconDeviceWatch,
  IconHome2,
  IconPaw,
  IconShirt,
  IconSparkles,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductCategoriesMessages } from "@/types/pages/product-categories/ProductCategoriesMessages-types";

interface ChipCategory {
  id: string;
  nameKey: string;
  icon: typeof IconDeviceLaptop;
  count: number;
}

const CATEGORIES: ChipCategory[] = [
  {
    id: "electronics",
    nameKey: "productCategories5Item1Name",
    icon: IconDeviceLaptop,
    count: 1284,
  },
  {
    id: "fashion",
    nameKey: "productCategories5Item2Name",
    icon: IconShirt,
    count: 3920,
  },
  {
    id: "home",
    nameKey: "productCategories5Item3Name",
    icon: IconHome2,
    count: 872,
  },
  {
    id: "beauty",
    nameKey: "productCategories5Item4Name",
    icon: IconSparkles,
    count: 640,
  },
  {
    id: "sports",
    nameKey: "productCategories5Item5Name",
    icon: IconBallFootball,
    count: 1105,
  },
  {
    id: "toys",
    nameKey: "productCategories5Item6Name",
    icon: IconDeviceGamepad2,
    count: 480,
  },
  {
    id: "books",
    nameKey: "productCategories5Item7Name",
    icon: IconBook2,
    count: 2430,
  },
  {
    id: "pets",
    nameKey: "productCategories5Item8Name",
    icon: IconPaw,
    count: 315,
  },
  {
    id: "baby",
    nameKey: "productCategories5Item9Name",
    icon: IconBabyCarriage,
    count: 268,
  },
  {
    id: "watches",
    nameKey: "productCategories5Item10Name",
    icon: IconDeviceWatch,
    count: 542,
  },
];

export function IconChipRowProductCategories() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithProductCategoriesMessages;
  const pc = t.productCategories;

  const [activeId, setActiveId] = useState<string>(CATEGORIES[0].id);
  const active =
    CATEGORIES.find((category) => category.id === activeId) ?? CATEGORIES[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {pc.productCategories5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pc.productCategories5Heading}
          </h2>
          <p className="text-muted">{pc.productCategories5Description}</p>
        </div>

        <div
          role="group"
          aria-label={pc.productCategories5ChipGroupAriaLabel}
          className="mt-8 flex flex-wrap gap-2.5"
        >
          {CATEGORIES.map((category) => {
            const isActive = category.id === activeId;
            const name = pc[category.nameKey];
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveId(category.id)}
                className={
                  isActive
                    ? "bg-brand text-brand-fg inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                    : "border-border bg-surface text-fg hover:bg-surface-hover inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                }
              >
                <category.icon size={16} aria-hidden="true" />
                {name}
              </button>
            );
          })}
        </div>

        <p className="text-muted mt-6 text-sm">
          {pc.productCategories5ProductsInLabel
            .replace("{count}", String(active.count))
            .replace("{category}", pc[active.nameKey])}
        </p>
      </div>
    </section>
  );
}
