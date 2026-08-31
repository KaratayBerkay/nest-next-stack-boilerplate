"use client";

import { useState } from "react";
import Image from "next/image";
import { IconBooks, IconSearch } from "@tabler/icons-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Kbd } from "@/components/ui/Kbd";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductSearchMessages } from "@/types/pages/product-search/ProductSearchMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface PaletteProduct {
  id: string;
  nameKey: string;
  price: number;
  seed: string;
}

interface PaletteGuide {
  id: string;
  labelKey: string;
}

const usd = (value: number) => `$${value.toFixed(2)}`;

const PRODUCTS: PaletteProduct[] = [
  {
    id: "noise-cancelling-headphones",
    nameKey: "productSearch5Product1Name",
    price: 149,
    seed: "product-search-5-headphones",
  },
  {
    id: "trail-runner",
    nameKey: "productSearch5Product2Name",
    price: 88,
    seed: "product-search-5-trail-runner",
  },
  {
    id: "weekend-duffel",
    nameKey: "productSearch5Product3Name",
    price: 67,
    seed: "product-search-5-weekend-duffel",
  },
  {
    id: "ceramic-pour-over",
    nameKey: "productSearch5Product4Name",
    price: 29,
    seed: "product-search-5-ceramic-pour-over",
  },
  {
    id: "desk-organizer",
    nameKey: "productSearch5Product5Name",
    price: 24,
    seed: "product-search-5-desk-organizer",
  },
  {
    id: "merino-sweater",
    nameKey: "productSearch5Product6Name",
    price: 92,
    seed: "product-search-5-merino-sweater",
  },
];

const GUIDES: PaletteGuide[] = [
  { id: "sizing", labelKey: "productSearch5Guide1Label" },
  { id: "shipping", labelKey: "productSearch5Guide2Label" },
  { id: "returns", labelKey: "productSearch5Guide3Label" },
];

export function CommandPaletteDialogProductSearch() {
  const t = useMessages("pages") as unknown as PagesWithProductSearchMessages;
  const ps = t.productSearch;
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {ps.productSearch5Heading}
        </h2>
        <p className="text-muted text-base">{ps.productSearch5Body}</p>
      </div>

      <div className="mx-auto mt-8 max-w-xl px-6 lg:px-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger variant="outline" size="lg" className="w-full">
            <span className="flex w-full items-center justify-between gap-2">
              <span className="text-muted flex items-center gap-2">
                <IconSearch size={16} aria-hidden="true" />
                {ps.productSearch5TriggerLabel}
              </span>
              <Kbd>⌘K</Kbd>
            </span>
          </DialogTrigger>
          <DialogContent size="md" closeLabel={ps.productSearch5CloseAria}>
            <DialogTitle className="sr-only">
              {ps.productSearch5DialogTitle}
            </DialogTitle>
            <Command>
              <CommandInput placeholder={ps.productSearch5SearchPlaceholder} />
              <CommandList>
                <CommandEmpty>{ps.productSearch5EmptyLabel}</CommandEmpty>
                <CommandGroup heading={ps.productSearch5ProductsGroupLabel}>
                  {PRODUCTS.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={ps[product.nameKey]}
                      onSelect={() => setOpen(false)}
                    >
                      <div className="bg-surface-hover relative size-8 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={placeholderImage(product.seed, "1x1")}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <span className="flex-1 truncate">
                        {ps[product.nameKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {usd(product.price)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading={ps.productSearch5GuidesGroupLabel}>
                  {GUIDES.map((guide) => (
                    <CommandItem
                      key={guide.id}
                      value={ps[guide.labelKey]}
                      onSelect={() => setOpen(false)}
                    >
                      <IconBooks
                        size={16}
                        aria-hidden="true"
                        className="text-muted"
                      />
                      {ps[guide.labelKey]}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
        <p className="text-muted mt-3 text-center text-xs">
          {ps.productSearch5Hint}
        </p>
      </div>
    </section>
  );
}
