"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconChevronDown,
  IconHeart,
  IconHeartFilled,
  IconMenu2,
  IconSearch,
  IconShoppingBag,
  IconTruck,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithEcommerceNavbarMessages } from "@/types/pages/ecommerce-navbar/EcommerceNavbarMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface MegaGroup {
  id: string;
  titleKey: string;
  itemKeys: string[];
}

const MEGA_GROUPS: MegaGroup[] = [
  {
    id: "clothing",
    titleKey: "ecommerceNavbar1MegaClothingTitle",
    itemKeys: [
      "ecommerceNavbar1MegaClothingItem1",
      "ecommerceNavbar1MegaClothingItem2",
      "ecommerceNavbar1MegaClothingItem3",
    ],
  },
  {
    id: "footwear",
    titleKey: "ecommerceNavbar1MegaFootwearTitle",
    itemKeys: [
      "ecommerceNavbar1MegaFootwearItem1",
      "ecommerceNavbar1MegaFootwearItem2",
      "ecommerceNavbar1MegaFootwearItem3",
    ],
  },
  {
    id: "accessories",
    titleKey: "ecommerceNavbar1MegaAccessoriesTitle",
    itemKeys: [
      "ecommerceNavbar1MegaAccessoriesItem1",
      "ecommerceNavbar1MegaAccessoriesItem2",
      "ecommerceNavbar1MegaAccessoriesItem3",
    ],
  },
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
    id: "sneaker",
    nameKey: "ecommerceNavbar1CartItem1Name",
    price: 89,
    qty: 1,
    imageSeed: "ecommerce-navbar-1-sneaker",
  },
  {
    id: "tote",
    nameKey: "ecommerceNavbar1CartItem2Name",
    price: 32,
    qty: 2,
    imageSeed: "ecommerce-navbar-1-tote",
  },
];

const usd = (value: number) => `$${value.toFixed(2)}`;

export function MegaMenuEcommerceNavbar() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceNavbarMessages;
  const n = t.ecommerceNavbar;

  const [query, setQuery] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
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
      <div className="bg-fg text-bg hidden items-center justify-between gap-4 px-6 py-2 text-xs sm:flex lg:px-8">
        <span className="inline-flex items-center gap-1.5">
          <IconTruck size={14} aria-hidden="true" />
          {n.ecommerceNavbar1PromoMessage}
        </span>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:underline">
            {n.ecommerceNavbar1TrackOrder}
          </Link>
          <Link href="#" className="hover:underline">
            {n.ecommerceNavbar1HelpCenter}
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-3 lg:px-8">
        <Sheet>
          <SheetTrigger
            aria-label={n.ecommerceNavbar1MobileMenuAria}
            className="text-fg hover:bg-surface-hover inline-flex size-9 shrink-0 items-center justify-center rounded-md md:hidden"
          >
            <IconMenu2 size={20} aria-hidden="true" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex flex-col gap-4 overflow-y-auto"
          >
            <SheetHeader className="text-left">
              <SheetTitle>{n.ecommerceNavbar1Brand}</SheetTitle>
            </SheetHeader>
            <Accordion type="single">
              {MEGA_GROUPS.map((group) => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger>{n[group.titleKey]}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-2">
                      {group.itemKeys.map((itemKey) => (
                        <li key={itemKey}>
                          <Link
                            href="#"
                            className="text-muted hover:text-fg text-sm"
                          >
                            {n[itemKey]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="flex flex-col gap-1">
              <Link href="#" className="text-fg py-2 text-sm font-medium">
                {n.ecommerceNavbar1NavNewArrivals}
              </Link>
              <Link href="#" className="text-error py-2 text-sm font-medium">
                {n.ecommerceNavbar1NavSale}
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="#" className="flex shrink-0 items-center gap-2">
          <span className="bg-brand text-brand-fg flex size-8 items-center justify-center rounded-lg text-sm font-bold">
            {n.ecommerceNavbar1Brand.slice(0, 1)}
          </span>
          <span className="text-fg text-lg font-semibold tracking-tight">
            {n.ecommerceNavbar1Brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-surface-hover inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium">
              {n.ecommerceNavbar1NavShop}
              <IconChevronDown size={14} aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="grid w-[min(88vw,620px)] grid-cols-4 gap-6 p-3">
                {MEGA_GROUPS.map((group) => (
                  <div key={group.id} className="flex flex-col">
                    <DropdownMenuLabel>{n[group.titleKey]}</DropdownMenuLabel>
                    {group.itemKeys.map((itemKey) => (
                      <DropdownMenuItem key={itemKey}>
                        {n[itemKey]}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
                <Link
                  href="#"
                  className="group border-border relative col-span-1 min-h-[180px] overflow-hidden rounded-xl border"
                >
                  <Image
                    src={placeholderImage("ecommerce-navbar-1-mega-promo", "3x4")}
                    alt=""
                    fill
                    sizes="150px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="from-fg/90 absolute inset-0 flex flex-col justify-end gap-0.5 bg-gradient-to-t to-transparent p-3">
                    <span className="text-bg text-xs font-semibold">
                      {n.ecommerceNavbar1MegaPromoTitle}
                    </span>
                    <span className="text-bg/80 text-[11px]">
                      {n.ecommerceNavbar1MegaPromoCta}
                    </span>
                  </div>
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="#"
            className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
          >
            {n.ecommerceNavbar1NavNewArrivals}
          </Link>
          <Link
            href="#"
            className="text-error hover:bg-error/10 rounded-md px-3 py-2 text-sm font-medium"
          >
            {n.ecommerceNavbar1NavSale}
          </Link>
        </nav>

        <div className="hidden max-w-xs flex-1 md:block">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={n.ecommerceNavbar1SearchPlaceholder}
            aria-label={n.ecommerceNavbar1SearchAria}
            leftIcon={<IconSearch size={16} aria-hidden="true" />}
            className="h-9"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <IconButton
            icon={
              wishlisted ? (
                <IconHeartFilled
                  size={20}
                  aria-hidden="true"
                  className="text-error"
                />
              ) : (
                <IconHeart size={20} aria-hidden="true" />
              )
            }
            label={n.ecommerceNavbar1WishlistAria}
            variant="ghost"
            aria-pressed={wishlisted}
            onClick={() => setWishlisted((prev) => !prev)}
            className="hidden sm:inline-flex"
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={n.ecommerceNavbar1AccountAria}
              className="hover:bg-surface-hover hidden size-9 items-center justify-center rounded-md sm:inline-flex"
            >
              <IconUserCircle size={20} aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                {n.ecommerceNavbar1AccountGreeting}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {n.ecommerceNavbar1AccountOrders}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {n.ecommerceNavbar1AccountSettings}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {n.ecommerceNavbar1AccountSignOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger
              aria-label={n.ecommerceNavbar1CartAria}
              className="hover:bg-surface-hover relative inline-flex size-9 items-center justify-center rounded-md"
            >
              <IconShoppingBag size={20} aria-hidden="true" />
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
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col gap-5 overflow-y-auto"
            >
              <SheetHeader className="text-left">
                <SheetTitle>{n.ecommerceNavbar1CartHeading}</SheetTitle>
              </SheetHeader>
              {cartItems.length === 0 ? (
                <p className="text-muted text-sm">
                  {n.ecommerceNavbar1CartEmpty}
                </p>
              ) : (
                <>
                  <ul className="flex flex-col gap-4">
                    {cartItems.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <div className="bg-surface-hover relative size-14 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={placeholderImage(item.imageSeed, "1x1")}
                            alt={n[item.nameKey]}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-fg text-sm font-medium">
                            {n[item.nameKey]}
                          </span>
                          <span className="text-muted text-xs">
                            {n.ecommerceNavbar1CartQtyLabel} {item.qty}
                          </span>
                        </div>
                        <span className="text-fg text-sm font-medium">
                          {usd(item.qty * item.price)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={n.ecommerceNavbar1CartRemoveAria}
                          onClick={() => removeCartItem(item.id)}
                        >
                          <IconX size={14} aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-border flex items-center justify-between border-t pt-4 text-sm font-semibold">
                    <span className="text-fg">
                      {n.ecommerceNavbar1CartSubtotalLabel}
                    </span>
                    <span className="text-fg">{usd(subtotal)}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="primary">
                      {n.ecommerceNavbar1CartCheckout}
                    </Button>
                    <Button variant="outline">
                      {n.ecommerceNavbar1CartViewAll}
                    </Button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="px-6 pb-3 md:hidden">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={n.ecommerceNavbar1SearchPlaceholder}
          aria-label={n.ecommerceNavbar1SearchAria}
          leftIcon={<IconSearch size={16} aria-hidden="true" />}
          className="h-9"
        />
      </div>
    </header>
  );
}
