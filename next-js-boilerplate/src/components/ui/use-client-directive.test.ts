import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";

/**
 * Canary test — ensures every component file that calls useComponentVariant
 * carries the "use client" directive. Without it, importing from a Server
 * Component produces a runtime crash. This test catches regressions at CI time.
 */

const uiDir = resolve(__dirname);

function getTsxFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTsxFiles(fullPath));
    } else if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.")) {
      files.push(fullPath);
    }
  }
  return files;
}

const allTsx = getTsxFiles(uiDir);

const needsDirective = allTsx.filter((file) => {
  const content = readFileSync(file, "utf-8");
  return content.includes("useComponentVariant");
});

describe('"use client" directive canary', () => {
  it.each(needsDirective.map((f) => f.replace(uiDir + "/", "")))(
    "%s has use client as line 1",
    (relativePath) => {
      const fullPath = join(uiDir, relativePath);
      const firstLine = readFileSync(fullPath, "utf-8")
        .split("\n")[0]
        .trim();
      expect(firstLine.replace(/;$/, "")).toBe('"use client"');
    },
  );
});
