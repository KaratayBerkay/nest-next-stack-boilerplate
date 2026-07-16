"use client";
import {
  Group as PanelGroup,
  Panel,
  Separator as Handle,
} from "react-resizable-panels";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants, type GlobalVariant } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ResizablePanelGroupProps } from "@/types/ui/Resizable-types";

const resizableVariants = {
  ...globalStyleVariants,
  default: "bg-border hover:bg-brand/60",
};

export function ResizablePanelGroup({
  className,
  direction,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <PanelGroup
      orientation={direction || "horizontal"}
      className={cn(
        "flex size-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

export { Panel as ResizablePanel };

export function ResizableHandle({
  className,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof Handle> & { variant?: GlobalVariant }) {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Handle
      className={cn(
        "focus-visible:ring-brand relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90 transition-colors data-[resize-handle-state=drag]:bg-brand/60",
        resolveVariant(resizableVariants, effectiveVariant),
        className,
      )}
      {...props}
    >
      <div className="bg-surface z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </div>
    </Handle>
  );
}
