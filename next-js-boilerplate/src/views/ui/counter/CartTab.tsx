"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Counter } from "@/components/ui/Counter";

export type CartItem = {
  id: string;
  name: string;
  detail: string;
  price: number;
  stock: number;
  qty: number;
};

const usd = (n: number) => `$${n.toFixed(2)}`;

const FREE_SHIPPING_THRESHOLD = 75;

function setQtyModuleLevel(
  id: string,
  qty: number,
  setItems: Dispatch<SetStateAction<CartItem[]>>,
) {
  setItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, qty } : item)),
  );
}

export function CartTab() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "tee",
      name: "Organic Cotton Tee",
      detail: "Size M · Sage",
      price: 24,
      stock: 10,
      qty: 1,
    },
    {
      id: "socks",
      name: "Wool Running Socks",
      detail: "3-pack",
      price: 16,
      stock: 4,
      qty: 2,
    },
    {
      id: "cap",
      name: "Corduroy Cap",
      detail: "One size",
      price: 19,
      stock: 2,
      qty: 1,
    },
  ]);

  const setQty = (id: string, qty: number) =>
    setQtyModuleLevel(id, qty, setItems);

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="surface divide-border max-w-md divide-y overflow-hidden">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p
              className={
                item.qty === 0
                  ? "text-muted text-sm line-through"
                  : "text-fg text-sm font-medium"
              }
            >
              {item.name}
            </p>
            <p className="text-muted text-xs">
              {item.detail} · {usd(item.price)}
              {item.stock <= 2 && (
                <span className="text-warning"> · Only {item.stock} left</span>
              )}
            </p>
          </div>
          <Counter
            label={item.name}
            min={0}
            max={item.stock}
            value={item.qty}
            onChange={(qty) => setQty(item.id, qty)}
          />
          <span className="text-fg w-14 text-right text-sm tabular-nums">
            {item.qty === 0 ? "—" : usd(item.qty * item.price)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-fg text-sm font-medium">
            Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <p className="text-muted text-xs">
            {remaining > 0 ? (
              <>Add {usd(remaining)} more for free shipping</>
            ) : (
              <span className="text-success">Qualifies for free shipping</span>
            )}
          </p>
        </div>
        <span className="text-fg text-base font-semibold tabular-nums">
          {usd(subtotal)}
        </span>
      </div>
    </div>
  );
}
