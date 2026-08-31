import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { PAGES_EXAMPLES } from "@/constants/pages-gallery";

const ROOT = process.cwd();
const PAGES_VIEWS_DIR = join(ROOT, "src", "views", "pages");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\./.test(entry)
      ? [full]
      : [];
  });
}

function loadMessages(lang: "en" | "tr"): Record<string, unknown> {
  return JSON.parse(
    readFileSync(
      join(ROOT, "messages", lang, "pages", "messages.json"),
      "utf8",
    ),
  );
}

function isTabTitleKey(key: string): boolean {
  return (
    key.endsWith("TabTitle") || (key.startsWith("tab") && key.endsWith("Title"))
  );
}

describe("pages gallery index (PAGES_EXAMPLES)", () => {
  it("has no duplicate slugs", () => {
    const slugs = PAGES_EXAMPLES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("is alphabetized by name so the index renders in a stable order", () => {
    const names = PAGES_EXAMPLES.map((p) => p.name);
    const sorted = [...names].sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }),
    );
    expect(names).toEqual(sorted);
  });

  it("lists exactly the categories that exist under views/pages", () => {
    const dirs = readdirSync(PAGES_VIEWS_DIR).filter(
      (entry) =>
        !entry.startsWith("_") &&
        statSync(join(PAGES_VIEWS_DIR, entry)).isDirectory(),
    );
    expect([...PAGES_EXAMPLES.map((p) => p.slug)].sort()).toEqual(dirs.sort());
  });
});

describe("chart colors stay valid CSS", () => {
  // Theme variables hold hex values (e.g. --brand: #4f46e5), so wrapping them
  // as hsl(var(--brand)) is invalid CSS and silently renders SVG in black.
  it("never wraps a theme variable in hsl()/hsla()", () => {
    const offenders = ["src/views", "src/components"]
      .flatMap((d) => walk(join(ROOT, d)))
      .filter((file) => /hsla?\(\s*var\(--/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});

describe("pages gallery i18n conventions", () => {
  const langs = ["en", "tr"] as const;

  it.each(langs)("%s: tab titles are unique within each category", (lang) => {
    const messages = loadMessages(lang);
    const duplicates: string[] = [];
    for (const [category, value] of Object.entries(messages)) {
      if (typeof value !== "object" || value === null) continue;
      const seen = new Map<string, string>();
      for (const [key, title] of Object.entries(value)) {
        if (typeof title !== "string" || !isTabTitleKey(key)) continue;
        const prior = seen.get(title);
        if (prior)
          duplicates.push(`${category}: "${title}" (${prior}, ${key})`);
        seen.set(title, key);
      }
    }
    expect(duplicates).toEqual([]);
  });

  it.each(langs)("%s: tab titles are named, not numbered", (lang) => {
    const messages = loadMessages(lang);
    const numbered: string[] = [];
    for (const [category, value] of Object.entries(messages)) {
      if (typeof value !== "object" || value === null) continue;
      for (const [key, title] of Object.entries(value)) {
        if (typeof title !== "string" || !isTabTitleKey(key)) continue;
        if (/\s\d+$/.test(title))
          numbered.push(`${category}.${key}: "${title}"`);
      }
    }
    expect(numbered).toEqual([]);
  });

  it.each(langs)("%s: no internal variant codename leaks into copy", (lang) => {
    const messages = loadMessages(lang);
    const leaks: string[] = [];
    const visit = (node: unknown, path: string) => {
      if (typeof node === "string") {
        // e.g. "Story and workplace photo grid — about6" (year ranges like
        // "2018 — 2021" are legitimate copy, so letters must precede digits)
        if (/—\s*[A-Za-z]+\d+\s*$/.test(node)) leaks.push(`${path}: "${node}"`);
        return;
      }
      if (typeof node === "object" && node !== null) {
        for (const [key, value] of Object.entries(node)) {
          visit(value, path ? `${path}.${key}` : key);
        }
      }
    };
    visit(messages, "");
    expect(leaks).toEqual([]);
  });
});

describe("generated pages manifest", () => {
  const ENTRY_RE =
    /id:\s*"([^"]+)"[\s\S]*?render:\s*\(\)\s*=>\s*<([A-Za-z][A-Za-z0-9_]*)/g;

  it("stays in sync with every category's PageContent", async () => {
    const { PAGES_MANIFEST } = await import("@/generated/pages-manifest");
    const dirs = readdirSync(PAGES_VIEWS_DIR).filter(
      (entry) =>
        !entry.startsWith("_") &&
        statSync(join(PAGES_VIEWS_DIR, entry)).isDirectory(),
    );
    expect(Object.keys(PAGES_MANIFEST).sort()).toEqual(dirs.sort());

    for (const category of dirs) {
      const pageContent = readFileSync(
        join(PAGES_VIEWS_DIR, category, "PageContent.tsx"),
        "utf8",
      );
      const parsed = [...pageContent.matchAll(ENTRY_RE)].map((m) => ({
        id: m[1],
        file: `${category}/${m[2]}.tsx`,
      }));
      expect(
        PAGES_MANIFEST[category],
        `manifest for "${category}" is stale — run pnpm generate-pages-sources`,
      ).toEqual(parsed);
      for (const entry of parsed) {
        expect(statSync(join(PAGES_VIEWS_DIR, entry.file)).isFile()).toBe(true);
      }
    }
  });
});

describe("template asset and token hygiene", () => {
  it("uses only local placeholder imagery — no external photo services", () => {
    const offenders = walk(PAGES_VIEWS_DIR).filter((file) =>
      /picsum\.photos|unsplash\.com|placehold\.co|via\.placeholder\.com/.test(
        readFileSync(file, "utf8"),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("every referenced placeholder file exists", () => {
    const seen = new Set<string>();
    for (const file of walk(PAGES_VIEWS_DIR)) {
      for (const m of readFileSync(file, "utf8").matchAll(
        /\/img\/placeholders\/(ph-[\w-]+\.webp)/g,
      )) {
        seen.add(m[1]);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
    for (const name of seen) {
      expect(
        statSync(join(ROOT, "public", "img", "placeholders", name)).isFile(),
        name,
      ).toBe(true);
    }
  });

  it("does not paint the muted text color as a surface", () => {
    // bg-muted (no opacity) is a #737373-style text color used as a
    // background — a token-vocabulary violation. The allow list is the few
    // spots where bg-muted is a *color swatch* (chart legend, status dot,
    // carousel dot), not a surface.
    const ALLOWED = new Set([
      "chart-group/YearOverYearComparison.tsx",
      "community/SocialChannels.tsx",
      "book-a-demo/WithFormAnimatedTestimonials.tsx",
    ]);
    const offenders: string[] = [];
    for (const file of walk(PAGES_VIEWS_DIR)) {
      const rel = file.slice(PAGES_VIEWS_DIR.length + 1);
      if (ALLOWED.has(rel)) continue;
      const content = readFileSync(file, "utf8");
      if (/(?:^|[\s"'{:])bg-muted(?=[\s"'}])/.test(content))
        offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });
});
