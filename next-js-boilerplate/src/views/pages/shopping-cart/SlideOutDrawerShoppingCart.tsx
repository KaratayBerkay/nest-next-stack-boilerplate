"use client";

import { useState } from "react";
import {
  IconHeart,
  IconShoppingBag,
  IconShoppingCart,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/Sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShoppingCartMessages } from "@/types/pages/shopping-cart/ShoppingCartMessages-types";

interface Cart2Item {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
}

type PanelTab = "cart" | "saved";

const usd = (n: number) => `$${n.toFixed(2)}`;

const INITIAL_CART: Cart2Item[] = [
  { id: "bottle", nameKey: "shoppingCart2Item1Name", price: 22, qty: 1 },
  { id: "case", nameKey: "shoppingCart2Item2Name", price: 18, qty: 2 },
  { id: "socks", nameKey: "shoppingCart2Item3Name", price: 14, qty: 1 },
];

const INITIAL_SAVED: Cart2Item[] = [
  { id: "candle", nameKey: "shoppingCart2Saved1Name", price: 26, qty: 1 },
  { id: "sunglasses", nameKey: "shoppingCart2Saved2Name", price: 45, qty: 1 },
];

export function SlideOutDrawerShoppingCart() {
  const t = useMessages("pages") as unknown as PagesWithShoppingCartMessages;
  const sc = t.shoppingCart;
  const [tab, setTab] = useState<PanelTab>("cart");
  const [cartItems, setCartItems] = useState<Cart2Item[]>(INITIAL_CART);
  const [savedItems, setSavedItems] = useState<Cart2Item[]>(INITIAL_SAVED);

  const updateQty = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty } : it)),
    );
  };

  const moveToSaved = (item: Cart2Item) => {
    setCartItems((prev) => prev.filter((it) => it.id !== item.id));
    setSavedItems((prev) => [...prev, item]);
  };

  const moveToCart = (item: Cart2Item) => {
    setSavedItems((prev) => prev.filter((it) => it.id !== item.id));
    setCartItems((prev) => [...prev, { ...item, qty: 1 }]);
  };

  const subtotal = cartItems.reduce((sum, it) => sum + it.qty * it.price, 0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              leftIcon={<IconShoppingCart size={18} aria-hidden="true" />}
            >
              {sc.shoppingCart2TriggerLabel}
              <Badge variant="soft" size="sm" pill className="ml-1">
                {cartItems.length}
              </Badge>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex flex-col gap-5 overflow-y-auto"
          >
            <SheetHeader className="text-left">
              <SheetTitle>{sc.shoppingCart2Heading}</SheetTitle>
              <SheetDescription>{sc.shoppingCart2Description}</SheetDescription>
            </SheetHeader>

            <ToggleGroup
              type="single"
              value={tab}
              onValueChange={(value) => {
                if (value) setTab(value as PanelTab);
              }}
              aria-label={sc.shoppingCart2Heading}
              className="w-fit"
            >
              <ToggleGroupItem value="cart" size="sm">
                {sc.shoppingCart2TabCart}
              </ToggleGroupItem>
              <ToggleGroupItem value="saved" size="sm">
                {sc.shoppingCart2TabSaved}
              </ToggleGroupItem>
            </ToggleGroup>

            {tab === "cart" ? (
              cartItems.length === 0 ? (
                <p className="text-muted text-sm">
                  {sc.shoppingCart2EmptyCartLabel}
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-fg truncate text-sm font-medium">
                          {sc[item.nameKey]}
                        </span>
                        <span className="text-muted text-xs">
                          {usd(item.price)}
                        </span>
                        <Counter
                          label={sc.shoppingCart2QuantityAriaTemplate.replace(
                            "{name}",
                            sc[item.nameKey],
                          )}
                          min={1}
                          max={9}
                          value={item.qty}
                          onChange={(qty) => updateQty(item.id, qty)}
                        />
                      </div>
                      <IconButton
                        icon={<IconHeart size={16} aria-hidden="true" />}
                        label={sc.shoppingCart2MoveToSavedLabel}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => moveToSaved(item)}
                      />
                    </li>
                  ))}
                </ul>
              )
            ) : savedItems.length === 0 ? (
              <p className="text-muted text-sm">
                {sc.shoppingCart2EmptySavedLabel}
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {savedItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-fg truncate text-sm font-medium">
                        {sc[item.nameKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {usd(item.price)}
                      </span>
                    </div>
                    <IconButton
                      icon={<IconShoppingBag size={16} aria-hidden="true" />}
                      label={sc.shoppingCart2MoveToCartLabel}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveToCart(item)}
                    />
                  </li>
                ))}
              </ul>
            )}

            {tab === "cart" && cartItems.length > 0 && (
              <div className="border-border mt-auto flex flex-col gap-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-fg">
                    {sc.shoppingCart2SubtotalLabel}
                  </span>
                  <span className="text-fg">{usd(subtotal)}</span>
                </div>
                <Button variant="primary" className="w-full">
                  {sc.shoppingCart2CheckoutLabel}
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
