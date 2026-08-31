export interface Draft {
  title: string;
  slug: string;
  tags: string[];
  body: string;
  savedAt: number;
}

export interface DraftValues {
  title: string;
  slug: string;
  tags: string[];
  body: string;
}

const DRAFT_KEY_PREFIX = "forms:draft:";
const DRAFT_SIZE_CAP = 50_000;

export function draftKey(userId?: string) {
  return DRAFT_KEY_PREFIX + (userId ?? "anonymous");
}

export function loadDraft(key: string): Draft | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (new Date(parsed.savedAt).getTime() < Date.now() - 86400000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(key: string, values: DraftValues) {
  try {
    const data = JSON.stringify({ ...values, savedAt: Date.now() });
    if (data.length > DRAFT_SIZE_CAP) return;
    localStorage.setItem(key, data);
  } catch {
    /* quota exceeded */
  }
}

export function clearDraft(key: string) {
  localStorage.removeItem(key);
}

export const TAKEN_SLUGS = new Set(["getting-started", "hello-world"]);

export function deriveSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
