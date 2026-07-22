import { IconShoppingBag } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import { Chevron } from "@/views/ui/collapsible/Chevron";

const orderItems = [
  { name: "Wireless Keyboard", qty: 1, price: 49.0 },
  { name: "USB-C Hub", qty: 2, price: 24.5 },
  { name: "Laptop Stand", qty: 1, price: 32.0 },
];

export function OrderSummaryTab() {
  const subtotal = orderItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const shipping = 4.99;
  const total = subtotal + shipping;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Checkout summary collapsed by default — the pattern mobile stores use to
        keep the payment form above the fold.
      </p>
      <Collapsible className="bg-surface border-border max-w-sm rounded-lg border">
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg px-4 py-3">
          <span className="text-fg flex items-center gap-2 text-sm font-medium">
            <IconShoppingBag className="size-4" aria-hidden="true" />
            Order summary
          </span>
          <span className="flex items-center gap-2">
            <span className="text-fg text-sm font-semibold">
              ${total.toFixed(2)}
            </span>
            <Chevron />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-border flex flex-col gap-2 border-t px-4 py-3 text-sm">
            {orderItems.map((item) => (
              <div
                key={item.name}
                className="text-muted flex items-center justify-between"
              >
                <span>
                  {item.name}
                  {item.qty > 1 && ` × ${item.qty}`}
                </span>
                <span>${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="text-muted border-border flex items-center justify-between border-t pt-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="text-muted flex items-center justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="text-fg flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
