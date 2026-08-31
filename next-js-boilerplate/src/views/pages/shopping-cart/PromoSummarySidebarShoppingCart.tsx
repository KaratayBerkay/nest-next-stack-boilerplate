"use client";

import { useState } from "react";
import { IconTag, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShoppingCartMessages } from "@/types/pages/shopping-cart/ShoppingCartMessages-types";

interface Cart6Item {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const PROMO_CODE = "save10";
const DISCOUNT_RATE = 0.1;
const SHIPPING = 7 as const;

const INITIAL_ITEMS: Cart6Item[] = [
  { id: "chair", nameKey: "shoppingCart6Item1Name", price: 149, qty: 1 },
  { id: "cushion", nameKey: "shoppingCart6Item2Name", price: 28, qty: 2 },
  { id: "throw", nameKey: "shoppingCart6Item3Name", price: 36, qty: 1 },
];

type PromoState = "idle" | "applied" | "invalid";

export function PromoSummarySidebarShoppingCart() {
  const t = useMessages("pages") as unknown as PagesWithShoppingCartMessages;
  const sc = t.shoppingCart;
  const [items, setItems] = useState<Cart6Item[]>(INITIAL_ITEMS);
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<PromoState>("idle");

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const applyPromo = () => {
    setPromoState(
      promo.trim().toLowerCase() === PROMO_CODE ? "applied" : "invalid",
    );
  };

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const discount = promoState === "applied" ? subtotal * DISCOUNT_RATE : 0;
  const shipping = items.length > 0 ? SHIPPING : 0;
  const total = subtotal + shipping - discount;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1fr_20rem] lg:px-8">
        <div className="flex flex-col gap-6">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sc.shoppingCart6Heading}
          </h2>
          <ul className="border-border divide-border divide-y rounded-xl border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-fg text-sm font-medium">
                    {sc[item.nameKey]}
                  </span>
                  <span className="text-muted text-xs">
                    {usd(item.price)} · × {item.qty}
                  </span>
                </div>
                <span className="text-fg text-sm font-semibold">
                  {usd(item.qty * item.price)}
                </span>
                <IconButton
                  icon={<IconX size={16} aria-hidden="true" />}
                  label={sc.shoppingCart6RemoveLabel}
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.id)}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface border-border flex h-fit flex-col gap-5 rounded-xl border p-6 lg:sticky lg:top-24">
          <h3 className="text-fg text-base font-semibold">
            {sc.shoppingCart6SummaryHeading}
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={promo}
                onChange={(e) => {
                  setPromo(e.target.value);
                  setPromoState("idle");
                }}
                placeholder={sc.shoppingCart6PromoPlaceholder}
                leftIcon={<IconTag size={16} aria-hidden="true" />}
              />
              <Button variant="outline" onClick={applyPromo}>
                {sc.shoppingCart6PromoApplyLabel}
              </Button>
            </div>
            {promoState === "applied" && (
              <Badge variant="success" className="w-fit">
                {sc.shoppingCart6PromoAppliedLabel}
              </Badge>
            )}
            {promoState === "invalid" && (
              <p className="text-error text-xs">
                {sc.shoppingCart6PromoInvalidLabel}
              </p>
            )}
            <p className="text-muted text-xs">{sc.shoppingCart6PromoHint}</p>
          </div>
          <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">
                {sc.shoppingCart6SubtotalLabel}
              </span>
              <span className="text-fg">{usd(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">
                {sc.shoppingCart6ShippingLabel}
              </span>
              <span className="text-fg">{usd(shipping)}</span>
            </div>
            {promoState === "applied" && (
              <div className="flex items-center justify-between">
                <span className="text-muted">
                  {sc.shoppingCart6DiscountLabel}
                </span>
                <span className="text-brand">-{usd(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-semibold">
              <span className="text-fg">{sc.shoppingCart6TotalLabel}</span>
              <span className="text-fg">{usd(total)}</span>
            </div>
          </div>
          <Button variant="primary" className="w-full">
            {sc.shoppingCart6ProceedLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
