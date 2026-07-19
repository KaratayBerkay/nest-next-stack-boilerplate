export type ThemeName =
  | "light"
  | "dark"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";

export const THEMES: { name: ThemeName; label: string }[] = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "shiny", label: "Shiny" },
  { name: "glass", label: "Glass" },
  { name: "neon", label: "Neon" },
  { name: "gradient", label: "Gradient" },
];

export const THEME_COOKIE_NAME = "theme";

/* Kept for backward compat with useComponentVariant */
export type ComponentStyle =
  | "default"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";

export function themeToComponentStyle(theme: ThemeName): ComponentStyle {
  if (theme === "light" || theme === "dark") return "default";
  return theme as ComponentStyle;
}
