import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function getAllMessages<T>(locale: string): T {
  const root = join(process.cwd(), "messages", locale);
  if (!existsSync(root)) {
    throw new Error(`No messages found for locale "${locale}"`);
  }

  const recurse = (dir: string, prefix: string): Record<string, unknown> => {
    const entries = readdirSync(dir, { withFileTypes: true });
    let result: Record<string, unknown> = {};
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = recurse(full, entry.name);
        result = { ...result, ...nested };
      } else if (entry.name === "messages.json") {
        const content = JSON.parse(readFileSync(full, "utf-8"));
        result[prefix] = content;
      }
    }
    return result;
  };

  return recurse(root, "") as T;
}
