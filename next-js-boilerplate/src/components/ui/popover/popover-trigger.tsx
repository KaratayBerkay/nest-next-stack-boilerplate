"use client";

import { Children, cloneElement } from "react";
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import { usePopover } from "./popover";
import type { PopoverTriggerProps } from "@/types/ui/Popover-types";

export function PopoverTrigger({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  asChild,
  children,
  ...props
}: PopoverTriggerProps) {
  const { open, toggle, triggerRef, contentId } = usePopover();

  const sharedProps = {
    ref: triggerRef,
    type: "button" as const,
    className: cn(
      "focus-visible:ring-brand inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
      fontClasses({ fontSize, fontWeight, fontFamily }),
      className,
    ),
    onClick: toggle,
    "data-state": open ? "open" : "closed",
    "aria-expanded": open,
    "aria-haspopup": "dialog" as const,
    "aria-controls": open ? contentId : undefined,
  };

  if (asChild && children) {
    const child = Children.only(children) as React.ReactElement;
    const childClassName = (child.props as { className?: string }).className;
    return cloneElement(child, {
      ...sharedProps,
      className: cn(sharedProps.className, childClassName),
    } as Record<string, unknown>);
  }

  return (
    <button {...sharedProps} {...props} />
  );
}
