/**
 * Generates TypeScript types from the folder-based message files under
 * `messages/`. Reads every locale's messages, validates they share the same
 * page set and key shapes, then writes an `I18nMessages` type to
 * `src/generated/i18n-messages.d.ts` so every `getMessages(locale, page)`
 * call gets full autocomplete.
 *
 * Run via: `pnpm generate-i18n-types`
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesRoot = join(__dirname, "..", "messages");
const outDir = join(__dirname, "..", "src", "generated");
const outFile = join(outDir, "i18n-messages.d.ts");

function getLocales(): string[] {
  return readdirSync(messagesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function getPages(locale: string): string[] {
  const localeDir = join(messagesRoot, locale);
  if (!existsSync(localeDir)) return [];

  // fallow-ignore-next-line complexity
  const recurse = (dir: string, prefix: string): string[] => {
    const entries = readdirSync(dir, { withFileTypes: true });
    const pages: string[] = [];
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        pages.push(
          ...recurse(full, prefix ? `${prefix}/${entry.name}` : entry.name),
        );
      } else if (entry.name === "messages.json") {
        pages.push(prefix);
      }
    }
    return pages;
  };

  return recurse(localeDir, "");
}

function readShape(locale: string, page: string): Record<string, unknown> {
  const file = join(messagesRoot, locale, page, "messages.json");
  return JSON.parse(readFileSync(file, "utf-8")) as Record<string, unknown>;
}

/** Collect all leaf-string keys recursively for shape comparison. */
// fallow-ignore-next-line complexity
function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

// fallow-ignore-next-line complexity
function shapeToType(value: unknown, indent = 2): string {
  const pad = "  ".repeat(indent);

  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (value === null) return "null";

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    const lines = entries.map(
      ([k, v]) => `${pad}  "${k}": ${shapeToType(v, indent + 1)};`,
    );
    return `{\n${lines.join("\n")}\n${pad}}`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const elemTypes = [...new Set(value.map((e) => shapeToType(e, indent)))];
    if (elemTypes.length === 1) return `${elemTypes[0]}[]`;
    return `(${elemTypes.join(" | ")})[]`;
  }

  return "unknown";
}

// fallow-ignore-next-line complexity
function generate(): void {
  const locales = getLocales();
  if (locales.length === 0) {
    console.error(
      "No locale directories found under messages/. Run from project root.",
    );
    process.exit(1);
  }

  // Discover the canonical page set from the first locale.
  const refLocale = locales[0];
  const refPages = getPages(refLocale);
  if (refPages.length === 0) {
    console.error(`No messages.json files found under messages/${refLocale}/.`);
    process.exit(1);
  }

  // Validate every locale has the same set of pages and compatible keys.
  let hasErrors = false;
  for (const locale of locales) {
    const pages = getPages(locale);

    // Check for missing pages.
    for (const page of refPages) {
      if (!pages.includes(page)) {
        console.error(
          `[ERROR] ${locale} is missing page "${page}" (present in ${refLocale})`,
        );
        hasErrors = true;
      }
    }

    // Check for extra pages.
    for (const page of pages) {
      if (!refPages.includes(page)) {
        console.error(
          `[ERROR] ${locale} has extra page "${page}" (not in ${refLocale})`,
        );
        hasErrors = true;
      }
    }

    // Check structural compatibility: same flat keys within each page.
    for (const page of refPages) {
      const refKeys = flattenKeys(readShape(refLocale, page));
      const localeKeys = flattenKeys(readShape(locale, page));
      const missing = refKeys.filter((k) => !localeKeys.includes(k));
      const extra = localeKeys.filter((k) => !refKeys.includes(k));
      if (missing.length > 0) {
        console.error(
          `[ERROR] ${locale}/${page} is missing keys: ${missing.join(", ")}`,
        );
        hasErrors = true;
      }
      if (extra.length > 0) {
        console.error(
          `[ERROR] ${locale}/${page} has extra keys: ${extra.join(", ")}`,
        );
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  // Generate type from the reference locale's shape.
  const pageEntries = refPages.map((page) => {
    const shape = readShape(refLocale, page);
    return `  "${page}": ${shapeToType(shape)}`;
  });

  const content = `// Auto-generated by scripts/generate-i18n-types.ts — do not edit.
// Run \`pnpm generate-i18n-types\` after adding / updating message files.

export type I18nMessages = {
${pageEntries.join("\n\n")}
};
`;

  if (!existsSync(outDir)) {
    writeFileSync(outDir, "", { flag: "a" });
  }
  writeFileSync(outFile, content, "utf-8");
  console.log("✓ Wrote", outFile);

  writeAggregatedJson(locales, outDir);
}

function writeAggregatedJson(locales: string[], outDir: string) {
  for (const locale of locales) {
    const pages = getPages(locale);
    const aggregated: Record<string, unknown> = {};
    for (const page of pages) {
      aggregated[page] = readShape(locale, page);
    }
    const localeFile = join(outDir, `i18n-messages-${locale}.json`);
    writeFileSync(localeFile, JSON.stringify(aggregated), "utf-8");
    console.log("✓ Wrote", localeFile);
  }
}

generate();
