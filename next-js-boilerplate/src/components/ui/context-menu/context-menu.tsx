"use client";
import { forwardRef } from "react";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  Separator,
  Label,
} from "@radix-ui/react-context-menu";
import { cn } from "@/lib/cn";
import { menuItemStyles } from "@/components/ui/menu-item-styles";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const contextMenuVariants = {
  ...globalStyleVariants,
  default: "bg-bg border-border text-fg",
};

export const ContextMenu = Root;
export const ContextMenuTrigger = Trigger;
export const ContextMenuSeparator = forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";
export const ContextMenuLabel = forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-muted px-2 py-1.5 text-xs font-semibold", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenuLabel";

export const ContextMenuContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & { variant?: string }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Portal>
      <Content
        ref={ref}
        className={cn(
          "z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-md",
          resolveVariant(contextMenuVariants, effectiveVariant),
          className,
        )}
        {...props}
      >
        <div className="pointer-events-auto">{props.children}</div>
      </Content>
    </Portal>
  );
});
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item>
>(({ className, ...props }, ref) => (
  <Item
    ref={ref}
    className={cn(
      menuItemStyles,
      "focus:bg-surface focus:text-fg gap-2",
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = "ContextMenuItem";
