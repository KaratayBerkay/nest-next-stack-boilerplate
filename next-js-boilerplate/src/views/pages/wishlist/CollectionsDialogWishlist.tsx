"use client";

import { useState } from "react";
import Image from "next/image";
import { IconGift, IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Empty } from "@/components/ui/Empty";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithWishlistMessages } from "@/types/pages/wishlist/WishlistMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Wishlist4Item {
  id: string;
  nameKey: string;
  price: number;
  seed: string;
}

interface Wishlist4Collection {
  id: string;
  nameKey: string;
  itemIds: string[];
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const ITEMS: Wishlist4Item[] = [
  {
    id: "mixer",
    nameKey: "wishlist4Item1Name",
    price: 249,
    seed: "wishlist4-mixer",
  },
  {
    id: "headphones",
    nameKey: "wishlist4Item2Name",
    price: 129,
    seed: "wishlist4-headphones",
  },
  {
    id: "boardgame",
    nameKey: "wishlist4Item3Name",
    price: 39,
    seed: "wishlist4-boardgame",
  },
  {
    id: "deskchair",
    nameKey: "wishlist4Item4Name",
    price: 219,
    seed: "wishlist4-deskchair",
  },
  {
    id: "monitorarm",
    nameKey: "wishlist4Item5Name",
    price: 69,
    seed: "wishlist4-monitorarm",
  },
];

const INITIAL_COLLECTIONS: Wishlist4Collection[] = [
  {
    id: "birthday",
    nameKey: "wishlist4Collection1Name",
    itemIds: ["mixer", "headphones", "boardgame"],
  },
  {
    id: "home-office",
    nameKey: "wishlist4Collection2Name",
    itemIds: ["deskchair", "monitorarm"],
  },
  {
    id: "gift-ideas",
    nameKey: "wishlist4Collection3Name",
    itemIds: [],
  },
];

function findItem(id: string): Wishlist4Item | undefined {
  return ITEMS.find((item) => item.id === id);
}

export function CollectionsDialogWishlist() {
  const t = useMessages("pages") as unknown as PagesWithWishlistMessages;
  const w = t.wishlist;

  const [collections, setCollections] =
    useState<Wishlist4Collection[]>(INITIAL_COLLECTIONS);
  const [activeId, setActiveId] = useState(INITIAL_COLLECTIONS[0].id);

  const activeCollection =
    collections.find((collection) => collection.id === activeId) ??
    collections[0];

  function handleRemove(collectionId: string, itemId: string) {
    setCollections((current) =>
      current.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              itemIds: collection.itemIds.filter((id) => id !== itemId),
            }
          : collection,
      ),
    );
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {w.wishlist4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {w.wishlist4Description}
          </Typography>
        </div>

        <div className="flex flex-wrap gap-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="border-border bg-surface flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
            >
              <span className="text-fg font-medium">
                {w[collection.nameKey]}
              </span>
              <span className="text-muted">· {collection.itemIds.length}</span>
            </div>
          ))}
        </div>

        <Dialog>
          <DialogTrigger variant="primary">
            <IconGift size={16} aria-hidden="true" className="mr-1.5" />
            {w.wishlist4OpenButton}
          </DialogTrigger>
          <DialogContent size="lg" closeLabel={w.wishlist4DialogCloseAria}>
            <DialogHeader>
              <DialogTitle>{w.wishlist4DialogTitle}</DialogTitle>
              <DialogDescription>
                {w.wishlist4DialogDescription}
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-5">
              <div
                role="tablist"
                aria-label={w.wishlist4DialogTitle}
                className="flex flex-wrap gap-2"
              >
                {collections.map((collection) => {
                  const isActive = collection.id === activeId;
                  return (
                    <button
                      key={collection.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveId(collection.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand text-brand-fg border-brand"
                          : "border-border bg-surface text-muted hover:bg-surface-hover hover:text-fg",
                      )}
                    >
                      {w[collection.nameKey]}
                      <span
                        className={cn(
                          "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                          isActive
                            ? "bg-brand-fg/20 text-brand-fg"
                            : "bg-muted/15 text-muted",
                        )}
                      >
                        {collection.itemIds.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeCollection.itemIds.length === 0 ? (
                <Empty
                  icon={<IconGift size={32} aria-hidden="true" />}
                  title={w.wishlist4EmptyTitle}
                  description={w.wishlist4EmptyDescription}
                />
              ) : (
                <ul className="flex flex-col gap-3">
                  {activeCollection.itemIds.map((itemId) => {
                    const item = findItem(itemId);
                    if (!item) return null;
                    const name = w[item.nameKey];
                    return (
                      <li
                        key={item.id}
                        className="border-border flex items-center gap-3 rounded-xl border p-3"
                      >
                        <div className="bg-surface-hover relative size-12 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={placeholderImage(item.seed, "1x1")}
                            alt={name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <span className="text-fg min-w-0 flex-1 truncate text-sm font-medium">
                          {name}
                        </span>
                        <span className="text-fg text-sm font-semibold">
                          {usd(item.price)}
                        </span>
                        <IconButton
                          icon={<IconX size={15} aria-hidden="true" />}
                          label={w.wishlist4RemoveAria.replace("{name}", name)}
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            handleRemove(activeCollection.id, item.id)
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </DialogBody>
            <DialogFooter>
              <DialogClose variant="primary">
                {w.wishlist4DoneButton}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
