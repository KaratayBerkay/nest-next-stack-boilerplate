import { z } from "zod";

const DEFAULT_EDITOR_T: Record<string, string> = {
  titleRequired: "Title required",
  slugInvalid: "Invalid slug",
};

export const editorSchema = createEditorSchema(DEFAULT_EDITOR_T);

export function createEditorSchema(t: Record<string, string>) {
  return z.object({
    title: z.string().min(1, t.titleRequired ?? "Title required"),
    slug: z.string().regex(/^[a-z0-9-]+$/, t.slugInvalid ?? "Invalid slug"),
    tags: z.array(z.string()),
    body: z.string().optional(),
    publishAt: z.date().optional(),
    publishTime: z.any().optional(),
  });
}
