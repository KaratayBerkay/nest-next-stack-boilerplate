"use client";

import { useState } from "react";
import Image from "next/image";
import { IconMoodEmpty, IconShoppingBag } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShoppingCartMessages } from "@/types/pages/shopping-cart/ShoppingCartMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Cart4Item {
  id: string;
  nameKey: string;
  price: number;
  imageSeed: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const RECENT_ITEMS: Cart4Item[] = [
  {
    id: "sneakers",
    nameKey: "shoppingCart4Item1Name",
    price: 68,
    imageSeed: "cart4-sneakers",
  },
  {
    id: "beanie",
    nameKey: "shoppingCart4Item2Name",
    price: 22,
    imageSeed: "cart4-beanie",
  },
  {
    id: "backpack",
    nameKey: "shoppingCart4Item3Name",
    price: 74,
    imageSeed: "cart4-backpack",
  },
];

export function EmptyCartShoppingCart() {
  const t = useMessages("pages") as unknown as PagesWithShoppingCartMessages;
  const sc = t.shoppingCart;
  const [added, setAdded] = useState<Set<string>>(new Set());

  const handleAdd = (id: string) => {
    setAdded((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 lg:px-8">
        <Empty
          icon={<IconMoodEmpty size={40} aria-hidden="true" />}
          title={sc.shoppingCart4EmptyTitle}
          description={sc.shoppingCart4EmptyDescription}
          action={
            <Button
              variant="primary"
              leftIcon={<IconShoppingBag size={16} aria-hidden="true" />}
            >
              {sc.shoppingCart4BrowseLabel}
            </Button>
          }
        />

        <div className="flex flex-col gap-4">
          <h3 className="text-fg text-lg font-semibold">
            {sc.shoppingCart4RecentHeading}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {RECENT_ITEMS.map((item) => {
              const isAdded = added.has(item.id);
              return (
                <Card key={item.id} variant="default">
                  <div className="flex flex-col gap-3 p-4">
                    <div className="bg-surface-hover relative aspect-square w-full overflow-hidden rounded-lg">
                      <Image
                        src={placeholderImage(item.imageSeed, "1x1")}
                        alt=""
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-fg text-sm font-medium">
                        {sc[item.nameKey]}
                      </p>
                      <p className="text-muted text-xs">{usd(item.price)}</p>
                    </div>
                    <Button
                      variant={isAdded ? "soft" : "outline"}
                      size="sm"
                      disabled={isAdded}
                      onClick={() => handleAdd(item.id)}
                      className="w-full"
                    >
                      {isAdded
                        ? sc.shoppingCart4AddedLabel
                        : sc.shoppingCart4AddLabel}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
