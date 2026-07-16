/**
 * Global component style recipes.
 *
 * When the user selects a global style (shiny/glass/neon/gradient) via
 * `useTheme().setComponentStyle`, `useComponentVariant()` returns that
 * style name. The variant map in each component must contain a matching
 * key — these recipes provide the generic class strings.
 *
 * Per-component maps spread these and then define their own specific
 * variants (default, primary, etc.):
 *
 * ```ts
 * const variants = { ...globalStyleVariants, default: "…", primary: "…" };
 * ```
 */
export const globalStyleVariants = {
  shiny:
    "bg-gradient-to-b from-surface to-surface-hover border border-border shadow-sm",
  glass:
    "bg-surface/60 backdrop-blur-md border border-border/50",
  neon:
    "bg-transparent border border-info text-info shadow-[0_0_12px_var(--info)]",
  gradient:
    "bg-gradient-to-r from-brand to-info text-brand-fg",
} as const;

export type GlobalVariant = keyof typeof globalStyleVariants;
