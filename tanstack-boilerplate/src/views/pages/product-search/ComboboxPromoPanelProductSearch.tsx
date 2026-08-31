"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { IconTag } from "@tabler/icons-react";
import { Combobox } from "@/components/ui/Combobox";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductSearchMessages } from "@/types/pages/product-search/ProductSearchMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface PromoProduct {
  id: string;
  nameKey: string;
  categoryKey: string;
  descKey: string;
  price: number;
  seed: string;
}

const usd = (value: number) => `$${value.toFixed(2)}`;

const PRODUCTS: PromoProduct[] = [
  {
    id: "studio-headphones",
    nameKey: "productSearch7Product1Name",
    categoryKey: "productSearch7Product1Category",
    descKey: "productSearch7Product1Desc",
    price: 159,
    seed: "product-search-7-studio-headphones",
  },
  {
    id: "commuter-backpack",
    nameKey: "productSearch7Product2Name",
    categoryKey: "productSearch7Product2Category",
    descKey: "productSearch7Product2Desc",
    price: 89,
    seed: "product-search-7-commuter-backpack",
  },
  {
    id: "road-runners",
    nameKey: "productSearch7Product3Name",
    categoryKey: "productSearch7Product3Category",
    descKey: "productSearch7Product3Desc",
    price: 79,
    seed: "product-search-7-road-runners",
  },
  {
    id: "steel-watch",
    nameKey: "productSearch7Product4Name",
    categoryKey: "productSearch7Product4Category",
    descKey: "productSearch7Product4Desc",
    price: 149,
    seed: "product-search-7-steel-watch",
  },
  {
    id: "polarized-sunglasses",
    nameKey: "productSearch7Product5Name",
    categoryKey: "productSearch7Product5Category",
    descKey: "productSearch7Product5Desc",
    price: 54,
    seed: "product-search-7-polarized-sunglasses",
  },
  {
    id: "table-lamp",
    nameKey: "productSearch7Product6Name",
    categoryKey: "productSearch7Product6Category",
    descKey: "productSearch7Product6Desc",
    price: 44,
    seed: "product-search-7-table-lamp",
  },
  {
    id: "pour-over-set",
    nameKey: "productSearch7Product7Name",
    categoryKey: "productSearch7Product7Category",
    descKey: "productSearch7Product7Desc",
    price: 36,
    seed: "product-search-7-pour-over-set",
  },
];

export function ComboboxPromoPanelProductSearch() {
  const t = useMessages("pages") as unknown as PagesWithProductSearchMessages;
  const ps = t.productSearch;
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const options = useMemo(
    () =>
      PRODUCTS.map((product) => ({
        value: product.id,
        label: `${ps[product.nameKey]} — ${usd(product.price)}`,
        group: ps[product.categoryKey],
      })),
    [ps],
  );

  const selected = PRODUCTS.find((product) => product.id === selectedId);
  const featured = selected ?? PRODUCTS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {ps.productSearch7Heading}
        </h2>
        <p className="text-muted text-base">{ps.productSearch7Body}</p>
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-4 px-6 sm:grid-cols-[minmax(0,1fr)_240px] lg:px-8">
        <div className="flex flex-col gap-2">
          <span className="text-fg text-sm font-medium">
            {ps.productSearch7ComboboxLabel}
          </span>
          <Combobox
            options={options}
            value={selectedId}
            onValueChange={(value) =>
              setSelectedId(Array.isArray(value) ? value[0] : value)
            }
            placeholder={ps.productSearch7ComboboxPlaceholder}
            searchPlaceholder={ps.productSearch7SearchPlaceholder}
            emptyTitle={ps.productSearch7EmptyTitle}
            emptyDescription={ps.productSearch7EmptyDescription}
          />
          <p className="text-muted text-xs">{ps.productSearch7Hint}</p>
        </div>

        <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-4">
          <span className="text-brand inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase">
            <IconTag size={12} aria-hidden="true" />
            {selected
              ? ps.productSearch7SelectedLabel
              : ps.productSearch7FeaturedLabel}
          </span>
          <div className="bg-surface-hover relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <Image
              src={placeholderImage(featured.seed, "4x3")}
              alt={ps[featured.nameKey]}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
          <span className="text-fg text-sm font-semibold">
            {ps[featured.nameKey]}
          </span>
          <span className="text-muted text-xs">{ps[featured.descKey]}</span>
          <span className="text-fg text-base font-semibold">
            {usd(featured.price)}
          </span>
        </div>
      </div>
    </section>
  );
}
