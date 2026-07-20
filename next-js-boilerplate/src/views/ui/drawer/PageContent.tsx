"use client";
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
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function BasicDrawerDemo() {
  const [activeSnap, setActiveSnap] = useState<number | string | null>(0.35);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Snap Points</h3>
      <p className="text-muted text-sm">
        Drawer snaps to predefined heights. Drag to peek or expand to full.
      </p>
      <Drawer
        snapPoints={[0.35, 1]}
        activeSnapPoint={activeSnap}
        setActiveSnapPoint={setActiveSnap}
      >
        <DrawerTrigger className="bg-brand rounded px-4 py-2 text-sm font-medium text-brand-fg">
          Open Drawer
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Snap Points</DrawerTitle>
            <DrawerDescription>
              Active snap:{" "}
              {typeof activeSnap === "number"
                ? `${Math.round(activeSnap * 100)}%`
                : activeSnap}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-1 flex-col gap-3 px-4">
            <p className="text-muted text-sm">
              This drawer has two snap points: 35% (peek) and 100% (full). Drag
              the handle or swipe to switch between them.
            </p>
            <div className="border-border rounded-lg border p-3">
              <p className="text-xs font-medium">Snap Point Debug</p>
              <p className="text-muted text-xs">
                Current: {String(activeSnap)}
              </p>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose className="border-border rounded border px-4 py-2 text-sm">
              Close
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </section>
  );
}

function CartSummaryDemo() {
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

function DrawerVariantGallery() {
  return (
    <section className="flex flex-col gap-3">
      <VariantGallery
        variants={["default"]}
        sizes={["sm", "md", "lg"]}
        render={(variant, size) => (
          <div className="flex items-center gap-2">
            <Drawer>
              <DrawerTrigger className="bg-brand rounded px-3 py-1.5 text-xs font-medium text-brand-fg">
                Open
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    {variant} / {size}
                  </DrawerTitle>
                  <DrawerDescription>Drawer variant demo</DrawerDescription>
                </DrawerHeader>
                <div className="text-muted px-4 py-2 text-sm">
                  Content for {variant} variant at {size} size.
                </div>
                <DrawerFooter>
                  <DrawerClose className="border-border rounded border px-3 py-1.5 text-xs">
                    Close
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      />
    </section>
  );
}

const examples: UIExample[] = [
  {
    id: "drawer-examples",
    title: "Drawer Examples",
    description: "Basic drawer with snap points.",
    render: () => <BasicDrawerDemo />,
  },
  {
    id: "cart-summary",
    title: "Cart Summary",
    description: "A drawer showing cart items with a total and checkout CTA.",
    render: () => <CartSummaryDemo />,
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Drawer component across all theme variants and sizes.",
    render: () => <DrawerVariantGallery />,
  },
];

export default function DrawerPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Drawer"
      intro="A modal drawer that slides in from the bottom."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
