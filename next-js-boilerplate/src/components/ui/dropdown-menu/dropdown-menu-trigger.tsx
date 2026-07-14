"use client";

import { Children, cloneElement } from "react";
import { cn } from "@/lib/cn";
import { useDropdownMenuContext } from "./dropdown-menu";
import { fontClasses } from "@/lib/font-classes";
import type { DropdownMenuTriggerProps } from "@/types/ui/DropdownMenu-types";

const defaultStyles = "text-fg";

export function DropdownMenuTrigger({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  onClick,
  asChild,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  if (asChild) {
    const child = Children.only(props.children) as React.ReactElement<{
      onClick?: React.MouseEventHandler;
      ref?: React.Ref<unknown>;
      className?: string;
    }>;
    const childOnClick = child.props.onClick as React.MouseEventHandler<HTMLButtonElement> | undefined;
    const mergedOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      childOnClick?.(e);
      if (!e.defaultPrevented) onClick?.(e);
      if (!e.defaultPrevented) setOpen(!open);
    };
    return (
      <span
        ref={triggerRef as React.Ref<HTMLSpanElement>}
        aria-haspopup="menu"
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
      >
        {cloneElement(child, {
          onClick: mergedOnClick,
          className: cn("inline-flex items-center justify-center", defaultStyles, fonts, className, child.props.className),
        } as React.HTMLAttributes<HTMLElement>)}
      </span>
    );
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(!open);
      }}
      className={cn(
        "inline-flex items-center justify-center",
        defaultStyles,
        fonts,
        className,
      )}
      {...props}
    />
  );
}