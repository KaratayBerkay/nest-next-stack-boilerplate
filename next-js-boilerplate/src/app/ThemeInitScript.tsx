import Script from "next/script";

export function ThemeInitScript() {
  return <Script src="/scripts/theme-init.js" strategy="beforeInteractive" />;
}
