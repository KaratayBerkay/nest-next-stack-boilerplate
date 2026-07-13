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
  DARK_THEMES,
  THEME_COOKIE_NAME,
  COMPONENT_STYLES,
  COMPONENT_STYLE_COOKIE_NAME,
  type ThemeName,
  type ComponentStyle,
} from "@/constants/theme";
import type { ThemeProviderProps } from "@/types/hooks/ThemeProvider-types";
export { THEMES, COMPONENT_STYLES };
export type { ThemeName, ComponentStyle };

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
  componentStyle: ComponentStyle;
  setComponentStyle: (style: ComponentStyle) => void;
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

function getComponentStyleCookie(): ComponentStyle | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COMPONENT_STYLE_COOKIE_NAME}=([^;]*)`),
  );
  if (match) {
    const value = match[1] as ComponentStyle;
    if (COMPONENT_STYLES.some((s) => s.name === value)) return value;
  }
  return null;
}

function setComponentStyleCookie(style: ComponentStyle) {
  document.cookie = `${COMPONENT_STYLE_COOKIE_NAME}=${style};path=/;max-age=31536000;samesite=lax`;
}

function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") return "light";
  // Respect the class already set by server / inline script
  const root = document.documentElement;
  if (root.classList.contains("theme-violet")) return "violet";
  for (const t of THEMES) {
    if (root.classList.contains(`theme-${t.name}`)) return t.name;
  }
  const fromCookie = getThemeCookie();
  if (fromCookie) return fromCookie;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialComponentStyle(): ComponentStyle {
  if (typeof window === "undefined") return "default";
  const root = document.documentElement;
  for (const s of COMPONENT_STYLES) {
    if (root.classList.contains(`style-${s.name}`)) return s.name;
  }
  const fromCookie = getComponentStyleCookie();
  if (fromCookie) return fromCookie;
  return "default";
}

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  // Remove all theme classes
  for (const t of THEMES) {
    root.classList.remove(`theme-${t.name}`);
  }
  root.classList.remove("theme-violet");
  // Add current theme class
  root.classList.add(`theme-${theme}`);
  // Keep `dark` class for Tailwind `dark:` variant backward compat
  root.classList.toggle("dark", DARK_THEMES.includes(theme));
}

function applyComponentStyle(style: ComponentStyle) {
  const root = document.documentElement;
  // Remove all component style classes
  for (const s of COMPONENT_STYLES) {
    root.classList.remove(`style-${s.name}`);
  }
  // Add current component style class
  root.classList.add(`style-${style}`);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>("light");
  const [componentStyle, setComponentStyleState] =
    useState<ComponentStyle>("default");

  // Intentional hydration guard: set theme once on mount from localStorage/cookie.
  useEffect(() => {
    const initial = getInitialTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    applyTheme(initial);

    const initialStyle = getInitialComponentStyle();
    setComponentStyleState(initialStyle);
    applyComponentStyle(initialStyle);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    applyTheme(next);
    setThemeCookie(next);
  }, []);

  const cycleTheme = useCallback(() => {
    const idx = THEMES.findIndex((t) => t.name === theme);
    const next = THEMES[(idx + 1) % THEMES.length].name;
    setTheme(next);
  }, [theme, setTheme]);

  const setComponentStyle = useCallback((next: ComponentStyle) => {
    setComponentStyleState(next);
    applyComponentStyle(next);
    setComponentStyleCookie(next);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, cycleTheme, componentStyle, setComponentStyle }}
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
