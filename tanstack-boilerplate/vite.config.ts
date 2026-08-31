import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(rootDir, "src");

/**
 * The compat layer keeps the 400+ files that import `next/*` compiling
 * unchanged: every Next.js module specifier is aliased to a shim that
 * re-implements its surface on top of TanStack Start / Router.
 * Mirror of the `paths` block in tsconfig.json.
 */
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

export default defineConfig(({ mode }) => {
  // The app reads server config via process.env (Vault-injected in prod).
  // For local dev/build, hydrate process.env from .env/.env.local like Next did.
  const env = loadEnv(mode, rootDir, "");
  for (const [key, value] of Object.entries(env)) {
    // NODE_ENV must stay under Vite's control (dev builds require
    // "development"); everything else fills gaps in process.env.
    if (key === "NODE_ENV") continue;
    if (process.env[key] === undefined) process.env[key] = value;
  }

  // Client code references process.env.NEXT_PUBLIC_* (inlined at build time by
  // Next). Reproduce that with static define replacements.
  const definePublicEnv = Object.fromEntries(
    Object.keys({ ...env, ...process.env })
      .filter((key) => key.startsWith("NEXT_PUBLIC_"))
      .map((key) => [
        `process.env.${key}`,
        JSON.stringify(process.env[key] ?? env[key] ?? ""),
      ]),
  );

  return {
    define: definePublicEnv,
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    plugins: [
      tailwindcss(),
      tanstackStart(),
      // Packages the server build as a runnable Node app (.output/server) that
      // also serves the client assets — `pnpm start` runs it.
      nitroV2Plugin(),
      viteReact({
        babel: {
          plugins: ["babel-plugin-react-compiler"],
        },
      }),
    ],
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
    server: {
      port: 3001,
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // "use client"/"use server" directives are inert under Vite — the
          // copied sources keep them for documentation value.
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
          if (warning.code === "SOURCEMAP_ERROR") return;
          warn(warning);
        },
      },
    },
  };
});
