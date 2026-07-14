import { globalStyleVariants } from "@/components/ui/global-style-variants";

export const inputBaseClasses =
  "border-border placeholder:text-muted/70 selection:bg-brand/20 focus-visible:ring-brand flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const inputErrorClasses =
  "border-error focus-visible:ring-error";

export const inputVariants = {
  ...globalStyleVariants,
  default: "border-border focus-visible:ring-brand",
} as const;

export const inputSizes = {
  sm: "h-8 text-xs px-2 py-1.5",
  md: "h-9 text-sm px-3 py-2",
  lg: "h-10 text-base px-4 py-2",
} as const;
