import { z } from "zod";
import { editorSchema } from "./editor";

export const editorDefaultValues = {
  title: "",
  slug: "",
  tags: [] as string[],
  body: "",
  publishAt: undefined as Date | undefined,
  publishTime: { hours: 0, minutes: 0, seconds: 0 },
} satisfies z.input<typeof editorSchema>;

type EditorFormValues = typeof editorDefaultValues;

export function createEditorInitialValues(
  record?: EditorFormValues,
): EditorFormValues {
  if (!record) return { ...editorDefaultValues };
  return {
    ...record,
    publishAt: record.publishAt ?? editorDefaultValues.publishAt,
    tags: record.tags ?? editorDefaultValues.tags,
    publishTime: record.publishTime ?? editorDefaultValues.publishTime,
  };
}
