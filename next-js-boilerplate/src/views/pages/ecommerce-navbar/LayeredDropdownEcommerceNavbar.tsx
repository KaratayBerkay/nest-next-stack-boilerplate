"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconChevronDown,
  IconSearch,
  IconShoppingCart,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithEcommerceNavbarMessages } from "@/types/pages/ecommerce-navbar/EcommerceNavbarMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface LayeredGroup {
  id: string;
  titleKey: string;
  itemKeys: string[];
}

interface LayeredCategory {
  id: string;
  labelKey: string;
  groups?: LayeredGroup[];
  accent?: boolean;
}

const CATEGORIES: LayeredCategory[] = [
  {
    id: "men",
    labelKey: "ecommerceNavbar2NavMen",
    groups: [
      {
        id: "men-clothing",
        titleKey: "ecommerceNavbar2MenClothingTitle",
        itemKeys: [
          "ecommerceNavbar2MenClothingItem1",
          "ecommerceNavbar2MenClothingItem2",
          "ecommerceNavbar2MenClothingItem3",
        ],
      },
      {
        id: "men-footwear",
        titleKey: "ecommerceNavbar2MenFootwearTitle",
        itemKeys: [
          "ecommerceNavbar2MenFootwearItem1",
          "ecommerceNavbar2MenFootwearItem2",
        ],
      },
    ],
  },
  {
    id: "women",
    labelKey: "ecommerceNavbar2NavWomen",
    groups: [
      {
        id: "women-clothing",
        titleKey: "ecommerceNavbar2WomenClothingTitle",
        itemKeys: [
          "ecommerceNavbar2WomenClothingItem1",
          "ecommerceNavbar2WomenClothingItem2",
          "ecommerceNavbar2WomenClothingItem3",
        ],
      },
      {
        id: "women-accessories",
        titleKey: "ecommerceNavbar2WomenAccessoriesTitle",
        itemKeys: [
          "ecommerceNavbar2WomenAccessoriesItem1",
          "ecommerceNavbar2WomenAccessoriesItem2",
        ],
      },
    ],
  },
  { id: "accessories", labelKey: "ecommerceNavbar2NavAccessories" },
  { id: "sale", labelKey: "ecommerceNavbar2NavSale", accent: true },
];

interface CartLine {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
  imageSeed: string;
}

const INITIAL_CART: CartLine[] = [
  {
    id: "jacket",
    nameKey: "ecommerceNavbar2CartItem1Name",
    price: 118,
    qty: 1,
    imageSeed: "ecommerce-navbar-2-jacket",
  },
  {
    id: "cap",
    nameKey: "ecommerceNavbar2CartItem2Name",
    price: 22,
    qty: 1,
    imageSeed: "ecommerce-navbar-2-cap",
  },
  {
    id: "socks",
    nameKey: "ecommerceNavbar2CartItem3Name",
    price: 14,
    qty: 3,
    imageSeed: "ecommerce-navbar-2-socks",
  },
];

const usd = (value: number) => `$${value.toFixed(2)}`;

export function LayeredDropdownEcommerceNavbar() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceNavbarMessages;
  const n = t.ecommerceNavbar;

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartLine[]>(INITIAL_CART);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );

  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <header className="border-border bg-bg w-full border-b">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-3 lg:px-8">
        <Link href="#" className="flex shrink-0 items-center gap-2">
          <span className="border-fg text-fg flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold">
            {n.ecommerceNavbar2Brand.slice(0, 1)}
          </span>
          <span className="text-fg hidden text-lg font-semibold tracking-tight sm:inline">
            {n.ecommerceNavbar2Brand}
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <IconButton
            icon={<IconSearch size={20} aria-hidden="true" />}
            label={n.ecommerceNavbar2SearchToggleAria}
            variant="ghost"
            aria-pressed={searchOpen}
            onClick={() => setSearchOpen((prev) => !prev)}
          />
          <IconButton
            icon={<IconUserCircle size={20} aria-hidden="true" />}
            label={n.ecommerceNavbar2AccountAria}
            variant="ghost"
            className="hidden sm:inline-flex"
          />
          <Drawer>
            <DrawerTrigger
              aria-label={n.ecommerceNavbar2CartAria}
              className="hover:bg-surface-hover relative inline-flex size-9 items-center justify-center rounded-md"
            >
              <IconShoppingCart size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <Badge
                  variant="error"
                  pill
                  size="sm"
                  className="absolute -top-1 -right-1 size-5 min-w-5 justify-center p-0 text-[10px] font-semibold"
                >
                  {cartCount}
                </Badge>
              )}
            </DrawerTrigger>
            <DrawerContent className="mx-auto max-w-lg">
              <DrawerHeader className="text-left">
                <DrawerTitle>{n.ecommerceNavbar2CartHeading}</DrawerTitle>
              </DrawerHeader>
              {cartItems.length === 0 ? (
                <p className="text-muted py-4 text-sm">
                  {n.ecommerceNavbar2CartEmpty}
                </p>
              ) : (
                <>
                  <ul className="flex max-h-64 flex-col gap-3 overflow-y-auto py-2">
                    {cartItems.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <div className="bg-surface-hover relative size-12 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={placeholderImage(item.imageSeed, "1x1")}
                            alt={n[item.nameKey]}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-fg text-sm font-medium">
                            {n[item.nameKey]}
                          </span>
                          <span className="text-muted text-xs">
                            {n.ecommerceNavbar2CartQtyLabel} {item.qty} ·{" "}
                            {usd(item.price)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={n.ecommerceNavbar2CartRemoveAria}
                          onClick={() => removeCartItem(item.id)}
                        >
                          <IconX size={14} aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <DrawerFooter className="border-border gap-3 border-t pt-4">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-fg">
                        {n.ecommerceNavbar2CartSubtotalLabel}
                      </span>
                      <span className="text-fg">{usd(subtotal)}</span>
                    </div>
                    <Button variant="primary" className="w-full">
                      {n.ecommerceNavbar2CartCheckout}
                    </Button>
                  </DrawerFooter>
                </>
              )}
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-border flex items-center gap-2 border-t px-6 py-2 lg:px-8">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={n.ecommerceNavbar2SearchPlaceholder}
            aria-label={n.ecommerceNavbar2SearchAria}
            leftIcon={<IconSearch size={16} aria-hidden="true" />}
            className="h-9 flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen(false)}
          >
            {n.ecommerceNavbar2SearchCancel}
          </Button>
        </div>
      ) : (
        <div className="border-border bg-surface/40 flex items-center gap-1 overflow-x-auto border-t px-6 py-2 lg:px-8">
          {CATEGORIES.map((category) =>
            category.groups ? (
              <DropdownMenu key={category.id}>
                <DropdownMenuTrigger className="hover:bg-surface-hover inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium">
                  {n[category.labelKey]}
                  <IconChevronDown size={12} aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="grid w-[min(85vw,380px)] grid-cols-2 gap-4 p-2">
                    {category.groups.map((group) => (
                      <div key={group.id} className="flex flex-col">
                        <DropdownMenuLabel>
                          {n[group.titleKey]}
                        </DropdownMenuLabel>
                        {group.itemKeys.map((itemKey) => (
                          <DropdownMenuItem key={itemKey}>
                            {n[itemKey]}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={category.id}
                href="#"
                className={
                  category.accent
                    ? "text-error hover:bg-error/10 shrink-0 rounded-full px-3 py-1.5 text-sm font-medium"
                    : "hover:bg-surface-hover shrink-0 rounded-full px-3 py-1.5 text-sm font-medium"
                }
              >
                {n[category.labelKey]}
              </Link>
            ),
          )}
        </div>
      )}
    </header>
  );
}
