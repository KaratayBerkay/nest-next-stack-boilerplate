"use client";
import { forwardRef } from "react";
import {
  Root,
  List,
  Item,
  Trigger,
  Content,
  Link,
} from "@radix-ui/react-navigation-menu";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants, type GlobalVariant } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const navMenuVariants = {
  ...globalStyleVariants,
  default: "bg-bg border-border text-fg",
};

export const NavigationMenu = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root> & { variant?: GlobalVariant }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Root
      ref={ref}
      className={cn(
        "relative z-10 flex max-w-max flex-1 items-center justify-center",
        resolveVariant(navMenuVariants, effectiveVariant),
        className,
      )}
      {...props}
    />
  );
});
NavigationMenu.displayName = "NavigationMenu";

export const NavigationMenuList = forwardRef<
  React.ElementRef<typeof List>,
  React.ComponentPropsWithoutRef<typeof List>
>(({ className, ...props }, ref) => (
  <List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center gap-1",
      className,
    )}
    {...props}
  />
));
NavigationMenuList.displayName = "NavigationMenuList";

export const NavigationMenuItem = Item;
export const NavigationMenuLink = Link;

export const NavigationMenuTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  React.ComponentPropsWithoutRef<typeof Trigger>
>(({ className, children, ...props }, ref) => (
  <Trigger
    ref={ref}
    className={cn(
      "focus:bg-surface focus:text-fg data-[active]:bg-surface data-[state=open]:bg-surface group hover:bg-surface-hover inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="relative top-px ml-1 transition-transform duration-200 group-data-[state=open]:rotate-180"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </Trigger>
));
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export const NavigationMenuContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & { variant?: GlobalVariant }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Content
      ref={ref}
      className={cn(
        "data-[motion=from-start]:animate-fade-in-up data-[motion=from-end]:animate-fade-in-up data-[motion=to-start]:animate-fade-in-up data-[motion=to-end]:animate-fade-in-up top-0 left-0 w-full rounded-md border p-4 shadow-md sm:w-auto",
        resolveVariant(navMenuVariants, effectiveVariant),
        className,
      )}
      {...props}
    >
      <div className="pointer-events-auto">{props.children}</div>
    </Content>
  );
});
NavigationMenuContent.displayName = "NavigationMenuContent";
