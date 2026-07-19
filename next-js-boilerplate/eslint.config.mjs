import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      }],
    },
  },
  ...nextTs,
  // eslint-config-next only wires a handful of jsx-a11y rules at "warn" as a side effect of
  // core-web-vitals (and already registers the "jsx-a11y" plugin instance, so re-declaring
  // `plugins` here would conflict) — just layer the full recommended ruleset on top.
  {
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  // Explicit compiler-aware hooks rules (Phase 10 T1).
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
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
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
