import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

// eslint-config-next was replaced by the equivalent standalone pieces:
// @eslint/js + typescript-eslint + eslint-plugin-react(-hooks) cover what
// core-web-vitals wired up, minus the Next.js-specific rules.
const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      react,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      "react/prop-types": "off",
      "react/no-unescaped-entities": "error",
      "react/display-name": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  // Explicit compiler-aware hooks rules.
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/set-state-in-effect": "error",
    },
  },
  // React Compiler ESLint rule (bail-out diagnostic).
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
  // Disable ESLint rules that conflict with Prettier (must come last).
  prettier,
  globalIgnores([
    "dist/**",
    ".output/**",
    ".tanstack/**",
    ".nitro/**",
    "out/**",
    "build/**",
    "coverage/**",
    "src/routeTree.gen.ts",
    // Generated template-source modules (large string payloads).
    "src/generated/pages-manifest.ts",
    "src/generated/pages-sources/**",
    "public/sw.js",
    "scripts/**",
    "e2e/**",
    "playwright/**",
  ]),
]);

export default eslintConfig;
