import { globalStyleVariants } from "@/components/ui/global-style-variants";

// Elevation rule: solid/bordered variants carry their own `shadow-xs`
// (cn() does not merge, so a base shadow could not be reliably overridden).
// Hover-lift (`hover:shadow-md`) is reserved for surface-colored variants
// (`default`, `shadow`) so it reads as a physical rise; flat variants
// (ghost, link, soft) stay flat on hover — no illusion to break.
export const variants = {
  ...globalStyleVariants,
  default:
    "bg-surface text-fg hover:bg-surface-hover border border-border shadow-xs hover:shadow-md",
  primary: "bg-brand text-brand-fg hover:bg-brand/90 shadow-xs",
  secondary: "bg-muted/15 text-fg hover:bg-muted/25 shadow-xs",
  outline: "border border-border bg-transparent hover:bg-surface-hover shadow-xs",
  ghost: "bg-transparent hover:bg-surface-hover",
  destructive: "bg-error text-error-fg hover:bg-error/90 shadow-xs",
  link: "text-brand underline-offset-4 hover:underline",
  soft: "bg-brand/10 text-brand hover:bg-brand/20 border border-brand/30",
  shadow: "bg-fg text-bg hover:bg-fg/90 shadow-md hover:shadow-lg",
} as const;

// Layout-only classes (V0 control heights: sm h-8 / md h-9 / lg h-10).
// Text size lives in `sizeFonts` so the fontSize prop can override it
// without fighting a text-* class baked into the size string.
export const sizes = {
  xs: "h-7 gap-1.5 px-2.5",
  sm: "h-8 gap-2 px-3",
  md: "h-9 gap-2 px-4",
  lg: "h-10 gap-2.5 px-5",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-xs": "size-7",
} as const;

export const sizeFonts = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
  icon: "text-sm",
  "icon-sm": "text-sm",
  "icon-xs": "text-xs",
} as const;

export type Variant = keyof typeof variants;
export type Size = keyof typeof sizes;
