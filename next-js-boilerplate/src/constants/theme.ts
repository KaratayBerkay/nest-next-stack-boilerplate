export type ThemeName = "light" | "dark" | "ocean" | "violet";

export const THEMES: { name: ThemeName; label: string }[] = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "ocean", label: "Ocean" },
  { name: "violet", label: "Violet" },
];

export const DARK_THEMES: ThemeName[] = ["dark", "violet"];

export const THEME_COOKIE_NAME = "theme";

export type ComponentStyle = "default" | "shiny" | "glass" | "neon" | "gradient";

export const COMPONENT_STYLES: { name: ComponentStyle; label: string }[] = [
  { name: "default", label: "Default" },
  { name: "shiny", label: "Shiny" },
  { name: "glass", label: "Glass" },
  { name: "neon", label: "Neon" },
  { name: "gradient", label: "Gradient" },
];

export const COMPONENT_STYLE_COOKIE_NAME = "componentStyle";
