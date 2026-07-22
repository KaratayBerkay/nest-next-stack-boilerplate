import { useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Input } from "@/components/ui/Input";

export function CartSummaryDemo() {
  const [promoCode, setPromoCode] = useState("");

  return (
    <section className="flex flex-col gap-3">
      <Drawer>
        <DrawerTrigger className="bg-brand rounded px-4 py-2 text-sm font-medium text-brand-fg">
          View Cart (3 items)
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Shopping Cart (3 items)</DrawerTitle>
            <DrawerDescription>
              Review your items before checkout
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-3 px-4">
            <div className="flex items-center justify-between text-sm">
              <span>Ergonomic Mouse × 1</span>
              <span className="font-medium">$59.99</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Mechanical Keyboard × 1</span>
              <span className="font-medium">$89.99</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>USB-C Cable × 2</span>
              <span className="font-medium">$39.98</span>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button variant="secondary" size="sm">
                Apply
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Order Total</span>
              <span>$189.97</span>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="primary" className="w-full">
              Checkout
            </Button>
            <DrawerClose className="border-border w-full rounded border px-4 py-2 text-sm">
              Continue Shopping
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </section>
  );
}
