/**
 * Checks for duplicate message keys across different pages **within the same
 * locale**. If two pages define the same top-level key, you probably want to
 * extract it into a shared message file — this script flags those cases so you
 * can decide.
 *
 * Run via:  npx tsx scripts/check-duplicate-messages.ts
 * Example:  pnpm check-duplicate-messages
 *
 * Exit code:
 *   0 – no duplicates found (or no message files exist)
 *   1 – at least one locale has cross-page duplicate keys
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesRoot = join(__dirname, "..", "messages");

interface PageEntry {
  page: string;
  file: string;
}

function getLocales(): string[] {
  return readdirSync(messagesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function getPages(locale: string): PageEntry[] {
  const localeDir = join(messagesRoot, locale);
  if (!existsSync(localeDir)) return [];

  const results: PageEntry[] = [];
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name === "messages.json") {
        results.push({ page: prefix, file: full });
      }
    }
  };
  walk(localeDir, "");
  return results;
}

function main(): void {
  const locales = getLocales();
  let hasDuplicates = false;

  for (const locale of locales) {
    const pages = getPages(locale);
    if (pages.length < 2) continue;

    // Collect { key → [page, ...] } across all pages in this locale.
    const keyMap = new Map<string, { page: string; file: string }[]>();

    for (const { page, file } of pages) {
      const raw = JSON.parse(readFileSync(file, "utf-8")) as Record<
        string,
        unknown
      >;
      for (const key of Object.keys(raw)) {
        if (!keyMap.has(key)) keyMap.set(key, []);
        keyMap.get(key)!.push({ page, file });
      }
    }

    // Report keys that appear in more than one page.
    for (const [key, locations] of keyMap) {
      if (locations.length > 1) {
        if (!hasDuplicates) {
          console.error(`\nDuplicate message keys found:\n`);
          hasDuplicates = true;
        }
        console.error(`  • "${key}" appears in:`);
        for (const loc of locations) {
          console.error(`      ${locale}/${loc.page}  (${loc.file})`);
        }
        console.error();
      }
    }
  }

  if (hasDuplicates) {
    console.error(
      "Tip: extract shared keys into messages/{locale}/shared/{component}/messages.json\n" +
        "and import them from there instead of duplicating.\n",
    );
    process.exit(1);
  }

  console.log("✓ No duplicate message keys found.");
}

main();
