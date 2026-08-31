// Compat shim for `next/font/google`.
// Fonts are self-hosted via @fontsource-variable packages (loaded in
// src/styles/fonts.css, imported by the root route). The returned `variable`
// class names match the classes fonts.css defines, so `--font-geist-sans` /
// `--font-geist-mono` resolve exactly as they did under next/font.

export interface GoogleFontOptions {
  weight?: string | Array<string>;
  style?: string | Array<string>;
  subsets?: Array<string>;
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  variable?: string;
  preload?: boolean;
  fallback?: Array<string>;
  adjustFontFallback?: boolean;
  axes?: Array<string>;
}

export interface NextFont {
  className: string;
  style: { fontFamily: string; fontWeight?: number; fontStyle?: string };
}

export interface NextFontWithVariable extends NextFont {
  variable: string;
}

function makeFont(
  className: string,
  variableClassName: string,
  fontFamily: string,
): (options?: GoogleFontOptions) => NextFontWithVariable {
  return () => ({
    className,
    variable: variableClassName,
    style: { fontFamily },
  });
}

export const Geist = makeFont(
  "font-geist-sans",
  "font-var-geist-sans",
  "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
);

export const Geist_Mono = makeFont(
  "font-geist-mono",
  "font-var-geist-mono",
  "'Geist Mono Variable', ui-monospace, monospace",
);
