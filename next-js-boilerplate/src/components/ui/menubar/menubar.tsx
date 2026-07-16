"use client";
import { forwardRef } from "react";
import {
  Root,
  Menu,
  Trigger,
  Portal,
  Content,
  Item,
  Separator,
  Label,
} from "@radix-ui/react-menubar";
import { cn } from "@/lib/cn";
import { menuItemStyles } from "@/components/ui/menu-item-styles";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants, type GlobalVariant } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const menubarVariants = {
  ...globalStyleVariants,
  default: "bg-bg border-border",
};

export const Menubar = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root> & { variant?: GlobalVariant }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Root
      ref={ref}
      className={cn(
        "flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        resolveVariant(menubarVariants, effectiveVariant),
        className,
      )}
      {...props}
    />
  );
});
Menubar.displayName = "Menubar";

export const MenubarMenu = Menu;
export const MenubarTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  React.ComponentPropsWithoutRef<typeof Trigger>
>(({ className, ...props }, ref) => (
  <Trigger
    ref={ref}
    className={cn(
      "focus:bg-surface focus:text-fg data-[state=open]:bg-surface data-[state=open]:text-fg flex cursor-default items-center rounded-md px-3 py-1 text-sm font-medium outline-none select-none",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = "MenubarTrigger";

export const MenubarContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & { variant?: GlobalVariant }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Portal>
      <Content
        ref={ref}
        className={cn(
          "z-50 min-w-48 overflow-hidden rounded-lg border p-1 shadow-lg",
          resolveVariant(menubarVariants, effectiveVariant),
          className,
        )}
        {...props}
      >
        <div className="pointer-events-auto">{props.children}</div>
      </Content>
    </Portal>
  );
});
MenubarContent.displayName = "MenubarContent";

export const MenubarItem = forwardRef<
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
MenubarItem.displayName = "MenubarItem";

export const MenubarSeparator = forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));
MenubarSeparator.displayName = "MenubarSeparator";

export const MenubarLabel = forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-muted px-2 py-1.5 text-xs font-semibold", className)}
    {...props}
  />
));
MenubarLabel.displayName = "MenubarLabel";
