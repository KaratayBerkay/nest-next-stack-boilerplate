"use client";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "Filter Panel",
    description: "Right-side sheet with form controls.",
    render: () => (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default Sides</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Right</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Right Sheet</SheetTitle>
                  <SheetDescription>
                    Slides in from the right side.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Left</Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Left Sheet</SheetTitle>
                  <SheetDescription>
                    Slides in from the left side.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Top</Button>
              </SheetTrigger>
              <SheetContent side="top">
                <SheetHeader>
                  <SheetTitle>Top Sheet</SheetTitle>
                  <SheetDescription>
                    Slides in from the top.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Bottom</Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Bottom Sheet</SheetTitle>
                  <SheetDescription>
                    Slides in from the bottom.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </section>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Navigation",
    description: "Left-side sheet with menu links.",
    render: () => (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Cart Sheet</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Cart</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Shopping Cart</SheetTitle>
                <SheetDescription>
                  3 items in your cart
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                {[
                  { name: "Widget Pro", price: "$29.99" },
                  { name: "Gadget Plus", price: "$49.99" },
                  { name: "Thingamajig", price: "$19.99" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm">{item.name}</span>
                    <span className="text-muted text-sm">{item.price}</span>
                  </div>
                ))}
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Checkout</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Settings Sheet</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Settings</Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>
                  Manage your application preferences
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                {["Notifications", "Appearance", "Privacy", "Security"].map(
                  (item) => (
                    <button
                      key={item}
                      className="hover:bg-surface-hover rounded-lg p-3 text-left text-sm transition-colors"
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Navigation Sheet</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Navigation</Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Browse application sections
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2 py-4">
                {["Dashboard", "Projects", "Team", "Analytics", "Settings"].map(
                  (item) => (
                    <button
                      key={item}
                      className="hover:bg-surface-hover rounded-lg p-3 text-left text-sm font-medium transition-colors"
                    >
                      {item}
                    </button>
                  ),
                )}
              </nav>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </section>
      </div>
    ),
  },
];

export default function SheetPage() {
  return (
    <ExampleTabs
      title="Sheet"
      intro="A slide-in panel from the edge with configurable side and variant."
      examples={examples}
    />
  );
}
