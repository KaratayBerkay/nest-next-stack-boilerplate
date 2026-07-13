import { globalStyleVariants } from "@/components/ui/global-style-variants";

export const variants = {
  ...globalStyleVariants,
  default:     "bg-surface text-fg hover:bg-surface-hover hover:shadow-md border border-border",
  primary:     "bg-brand text-brand-fg hover:opacity-90",
  secondary:   "bg-surface text-fg hover:bg-surface-hover",
  outline:     "border border-border bg-transparent hover:bg-surface-hover",
  ghost:       "bg-transparent hover:bg-surface-hover",
  destructive: "bg-error text-error-fg hover:opacity-90 border border-error",
  link:        "text-brand underline-offset-4 hover:underline",
  soft:        "bg-brand/15 text-brand hover:bg-brand/20 border border-brand/30",
  shadow:      "bg-fg text-bg hover:opacity-90 hover:shadow-md shadow-md",
} as const;

export const sizes = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-xs": "size-7",
} as const;

export type Variant = keyof typeof variants;
export type Size = keyof typeof sizes;
