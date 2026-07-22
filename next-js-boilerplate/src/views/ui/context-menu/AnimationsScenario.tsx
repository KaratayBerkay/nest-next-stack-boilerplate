"use client";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/ContextMenu";
import type { ContextMenuAnimation } from "@/types/ui/ContextMenu-types";

const animationTypes: { animation: ContextMenuAnimation; label: string }[] = [
  { animation: "center", label: "Center pop (default)" },
  { animation: "left", label: "From left" },
  { animation: "right", label: "From right" },
  { animation: "top", label: "From top" },
  { animation: "bottom", label: "From bottom" },
];

export function AnimationsScenario() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Animations</h3>
      <p className="text-muted text-sm">
        The menu pops from center by default; the four directional types slide
        in from the given side.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {animationTypes.map(({ animation, label }) => (
          <ContextMenu key={animation}>
            <ContextMenuTrigger className="border-border bg-surface flex h-24 cursor-pointer items-center justify-center rounded-md border text-sm">
              {label}
            </ContextMenuTrigger>
            <ContextMenuContent animation={animation}>
              <ContextMenuLabel>{label}</ContextMenuLabel>
              <ContextMenuItem>Edit</ContextMenuItem>
              <ContextMenuItem>Duplicate</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-error">Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </section>
  );
}
