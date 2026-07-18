#!/usr/bin/env node
/**
 * WCAG contrast checker for the .theme-* palettes in globals.css.
 *
 * Usage (from repo root):
 *   node .claude/skills/tailwind-theming/scripts/check-contrast.mjs [themeName] [--strict]
 *
 * Parses every `.theme-<name> { --var: #hex; ... }` block and reports the
 * contrast ratio for each critical pair. `--strict` exits 1 if any hard
 * requirement (marked ✗) fails — useful in CI.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(here, "../../../../next-js-boilerplate/src/app/globals.css");

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const themeFilter = args.find((a) => !a.startsWith("--"));

const css = readFileSync(cssPath, "utf8");

// Collect .theme-* blocks (`:root, .theme-light { ... }` also matches).
const themes = {};
const blockRe = /\.style-([a-z0-9-]+)\s*\{([^}]*)\}/g;
for (const m of css.matchAll(blockRe)) {
  const [, name, body] = m;
  const vars = {};
  for (const v of body.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    vars[v[1]] = v[2];
  }
  if (Object.keys(vars).length) themes[name] = vars;
}

function srgbChannel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6); // ignore alpha
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [foreground, background, minimum, hard]
// hard=true pairs are body-text-critical: below `min` fails even in --strict-less
// summary; soft pairs pass at >=3.0 (WCAG AA large text) with a warning.
const PAIRS = [
  ["fg", "bg", 4.5, true],
  ["fg", "surface", 4.5, true],
  ["muted", "bg", 4.5, false],
  ["muted-fg", "surface", 4.5, false],
  ["brand-fg", "brand", 4.5, true],
  ["brand", "bg", 3.0, false],
  ["success-fg", "success", 4.5, false],
  ["warning-fg", "warning", 4.5, false],
  ["error-fg", "error", 4.5, false],
  ["info-fg", "info", 4.5, false],
];

let hardFailures = 0;
const names = Object.keys(themes).filter((n) => !themeFilter || n === themeFilter);
if (!names.length) {
  console.error(themeFilter ? `No theme named "${themeFilter}" found.` : "No .theme-* blocks found.");
  process.exit(2);
}

for (const name of names) {
  const t = themes[name];
  console.log(`\n.theme-${name}`);
  for (const [fgVar, bgVar, min, hard] of PAIRS) {
    const fg = t[fgVar];
    const bg = t[bgVar];
    if (!fg || !bg) {
      console.log(`  ✗ MISSING  --${!fg ? fgVar : bgVar}`);
      hardFailures++;
      continue;
    }
    const r = ratio(fg, bg);
    let mark;
    if (r >= min) mark = "✓";
    else if (!hard && r >= 3.0) mark = "~"; // AA large-text only
    else { mark = "✗"; hardFailures++; }
    console.log(
      `  ${mark} ${`${fgVar} on ${bgVar}`.padEnd(24)} ${r.toFixed(2).padStart(6)}  (min ${min})${mark === "~" ? "  large-text only" : ""}`,
    );
  }
  // Border visibility is informational: too low and hairlines vanish.
  if (t.border && t.bg) {
    const r = ratio(t.border, t.bg);
    console.log(`  ${r >= 1.15 ? "✓" : "~"} ${"border vs bg".padEnd(24)} ${r.toFixed(2).padStart(6)}  (visibility, ≥1.15)`);
  }
}

console.log(`\n${hardFailures === 0 ? "All hard checks passed." : `${hardFailures} hard failure(s).`} (✓ pass, ~ large-text only, ✗ fail)`);
if (strict && hardFailures > 0) process.exit(1);
