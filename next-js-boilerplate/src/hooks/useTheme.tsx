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
  type ThemeName,
} from "@/constants/theme";
export { THEMES };
export type { ThemeName };

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("light");

  // Intentional hydration guard: set theme once on mount from localStorage/cookie.
  useEffect(() => {
    const initial = getInitialTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    applyTheme(initial);
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

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
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
