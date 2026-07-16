"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  THEMES,
  THEME_COOKIE_NAME,
  themeToComponentStyle,
  type ThemeName,
  type ComponentStyle,
} from "@/constants/theme";
import type { ThemeProviderProps } from "@/types/hooks/ThemeProvider-types";
export { THEMES };
export type { ThemeName, ComponentStyle };

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  componentStyle: ComponentStyle;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getThemeCookie(): ThemeName | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${THEME_COOKIE_NAME}=([^;]*)`),
  );
  if (match) {
    const value = match[1] as ThemeName;
    if (THEMES.some((t) => t.name === value)) return value;
  }
  return null;
}

function setThemeCookie(theme: ThemeName) {
  document.cookie = `${THEME_COOKIE_NAME}=${theme};path=/;max-age=31536000;samesite=lax`;
}

function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") return "dark";
  const root = document.documentElement;
  // Reconstruct from DOM classes — all options use style-{name}
  if (root.classList.contains("style-gradient")) return "gradient";
  if (root.classList.contains("style-neon")) return "neon";
  if (root.classList.contains("style-glass")) return "glass";
  if (root.classList.contains("style-shiny")) return "shiny";
  if (root.classList.contains("style-dark")) return "dark";
  if (root.classList.contains("style-light")) return "light";
  // Check legacy componentStyle cookie
  const legacyStyleMatch = document.cookie.match(/(?:^|;\s*)componentStyle=([^;]*)/);
  if (legacyStyleMatch) {
    const v = legacyStyleMatch[1];
    if (["shiny", "glass", "neon", "gradient"].includes(v)) return v as ThemeName;
  }
  const fromCookie = getThemeCookie();
  if (fromCookie) return fromCookie;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  // Remove all style classes
  for (const s of ["light", "dark", "default", "shiny", "glass", "neon", "gradient"] as const) {
    root.classList.remove(`style-${s}`);
  }
  root.classList.remove("dark");
  // Map unified theme to a single style-{name} class
  root.classList.add(`style-${theme}`);
  if (theme !== "light") {
    root.classList.add("dark");
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>("dark");

  useEffect(() => {
    const initial = getInitialTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    applyTheme(initial);

    // Migrate legacy componentStyle cookie
    const legacyStyleMatch = document.cookie.match(/(?:^|;\s*)componentStyle=([^;]*)/);
    if (legacyStyleMatch) {
      document.cookie = "componentStyle=;path=/;max-age=0;samesite=lax";
    }
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    applyTheme(next);
    setThemeCookie(next);
  }, []);

  const componentStyle = themeToComponentStyle(theme);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, componentStyle }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
