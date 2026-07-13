"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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

export default function SheetPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Sheet</h2>
        <p className="text-muted text-sm">
          A slide-in panel from the edge with configurable side and variant.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
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

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Shiny</h3>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Shiny Sheet</Button>
                </SheetTrigger>
                <SheetContent side="right" variant="shiny">
                  <SheetHeader>
                    <SheetTitle>Shiny Sheet</SheetTitle>
                    <SheetDescription>
                      A shiny gradient variant sheet panel.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Glass Sheet</Button>
                  </SheetTrigger>
                  <SheetContent side="right" variant="glass">
                    <SheetHeader>
                      <SheetTitle className="text-white">Glass Sheet</SheetTitle>
                      <SheetDescription className="text-white/70">
                        A frosted glass variant sheet panel.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Neon</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Neon Sheet</Button>
                  </SheetTrigger>
                  <SheetContent side="right" variant="neon">
                    <SheetHeader>
                      <SheetTitle className="text-cyan-400">Neon Sheet</SheetTitle>
                      <SheetDescription className="text-cyan-400/70">
                        A neon glow variant sheet panel.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Gradient</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Gradient Sheet</Button>
                  </SheetTrigger>
                  <SheetContent side="right" variant="gradient">
                    <SheetHeader>
                      <SheetTitle>Gradient Sheet</SheetTitle>
                      <SheetDescription>
                        A gradient variant sheet panel.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Cart Sheet (Glass)</h3>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Cart</Button>
                </SheetTrigger>
                <SheetContent side="right" variant="glass">
                  <SheetHeader>
                    <SheetTitle className="text-white">Shopping Cart</SheetTitle>
                    <SheetDescription className="text-white/70">
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
                        className="flex items-center justify-between rounded-lg border border-white/10 p-3"
                      >
                        <span className="text-white text-sm">{item.name}</span>
                        <span className="text-white/70 text-sm">{item.price}</span>
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
              <h3 className="text-lg font-semibold">Settings Sheet (Neon)</h3>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Settings</Button>
                </SheetTrigger>
                <SheetContent side="left" variant="neon">
                  <SheetHeader>
                    <SheetTitle className="text-cyan-400">Settings</SheetTitle>
                    <SheetDescription className="text-cyan-400/70">
                      Manage your application preferences
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 py-4">
                    {["Notifications", "Appearance", "Privacy", "Security"].map(
                      (item) => (
                        <button
                          key={item}
                          className="text-cyan-400/80 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg p-3 text-left text-sm transition-colors"
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
              <h3 className="text-lg font-semibold">Navigation Sheet (Gradient)</h3>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Navigation</Button>
                </SheetTrigger>
                <SheetContent side="left" variant="gradient">
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
                          className="hover:bg-white/5 rounded-lg p-3 text-left text-sm font-medium transition-colors"
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
