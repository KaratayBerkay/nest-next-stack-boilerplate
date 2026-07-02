export type ThemeName = "light" | "dark" | "ocean" | "violet";

export const THEMES: { name: ThemeName; label: string }[] = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "ocean", label: "Ocean" },
  { name: "violet", label: "Violet" },
];

export const DARK_THEMES: ThemeName[] = ["dark", "violet"];

export const THEME_COOKIE_NAME = "theme";
