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

export function BasicDrawerDemo() {
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
