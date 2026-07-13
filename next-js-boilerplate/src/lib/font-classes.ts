/**
 * Resolve the font-trio (fontSize, fontWeight, fontFamily) into a single
 * class string, with per-component defaults.
 *
 * Eliminates the repeated three-line pattern across ~42 component files:
 * ```ts
 * const fontSizeClass = fontSize || "text-sm";
 * const fontWeightClass = fontWeight || "font-medium";
 * const fontFamilyClass = fontFamily || "font-sans";
 * ```
 */
export function fontClasses(
  props: { fontSize?: string; fontWeight?: string; fontFamily?: string },
  defaults?: { fontSize?: string; fontWeight?: string; fontFamily?: string },
): string {
  return [
    props.fontSize || defaults?.fontSize || "text-sm",
    props.fontWeight || defaults?.fontWeight || "font-medium",
    props.fontFamily || defaults?.fontFamily || "font-sans",
  ].join(" ");
}
