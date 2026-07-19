import { z } from "zod";

export const editorSchema = z.object({
  title: z.string().min(1, "Title required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Invalid slug"),
  tags: z.array(z.string()),
  body: z.string().optional(),
  publishAt: z.date().optional(),
  publishTime: z.any().optional(),
});
