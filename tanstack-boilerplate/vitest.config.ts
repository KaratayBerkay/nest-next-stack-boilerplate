import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const srcDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "src",
);

// Mirror of the aliases in vite.config.ts (the Next.js compat layer plus @/).
const nextCompatAliases = [
  ["next/image", "image.tsx"],
  ["next/link", "link.tsx"],
  ["next/navigation", "navigation.ts"],
  ["next/headers", "headers.ts"],
  ["next/server", "server.ts"],
  ["next/dynamic", "dynamic.tsx"],
  ["next/script", "script.tsx"],
  ["next/cache", "cache.ts"],
  ["next/font/google", "font-google.ts"],
  ["next/web-vitals", "web-vitals.ts"],
  ["server-only", "server-only.ts"],
  ["next", "index.ts"],
].map(([specifier, file]) => ({
  find: new RegExp(`^${specifier.replace(/[/-]/g, (m) => `\\${m}`)}$`),
  replacement: path.resolve(srcDir, "compat/next", file),
}));

// Unit + component tests. Playwright e2e lives in /e2e and is excluded here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      ...nextCompatAliases,
      {
        find: /^@tanstack\/react-form-nextjs$/,
        replacement: "@tanstack/react-form-start",
      },
      { find: /^@\//, replacement: `${srcDir}/` },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**", ".output/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/*.d.ts",
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 55,
        lines: 60,
      },
    },
  },
});
