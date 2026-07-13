"use client";

import { useTheme, type ComponentStyle } from "@/hooks/useTheme";

/**
 * Returns the effective component variant based on the global component
 * style and an optional explicit override.
 *
 * If `explicitVariant` is provided, it takes precedence. Otherwise, the
 * global `componentStyle` from the theme context is used.
 */
export function useComponentVariant<V extends string>(
  explicitVariant?: V,
): V | ComponentStyle {
  const { componentStyle } = useTheme();
  return (explicitVariant ?? componentStyle) as V | ComponentStyle;
}
