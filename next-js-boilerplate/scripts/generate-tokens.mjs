#!/usr/bin/env node

/**
 * Generates CSS custom properties from tokens.json.
 * Usage: node scripts/generate-tokens.mjs
 *
 * Reads src/constants/tokens.json and appends/updates the semantic token
 * blocks in src/app/globals.css for light, dark, and moonnote themes.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TOKENS_PATH = resolve(ROOT, "src/constants/tokens.json");
const CSS_PATH = resolve(ROOT, "src/app/globals.css");

const tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf-8"));

function generateThemeBlock(name, vars) {
  const lines = Object.entries(vars).map(
    ([key, value]) => `  --${key}: ${value};`,
  );
  return `.style-${name} {\n${lines.join("\n")}\n}`;
}

const blocks = Object.entries(tokens.themes)
  .map(([name, vars]) => generateThemeBlock(name, vars))
  .join("\n\n");

let css = readFileSync(CSS_PATH, "utf-8");

// Replace each theme block if it exists, otherwise append
for (const [name, vars] of Object.entries(tokens.themes)) {
  const block = generateThemeBlock(name, vars);
  const regex = new RegExp(`\\.style-${name}\\s*\\{[^}]*\\}`, "g");
  if (regex.test(css)) {
    css = css.replace(regex, block);
  } else {
    css += `\n\n${block}`;
  }
}

writeFileSync(CSS_PATH, css);
console.log(
  `✓ Generated ${Object.keys(tokens.themes).length} theme blocks in globals.css`,
);
