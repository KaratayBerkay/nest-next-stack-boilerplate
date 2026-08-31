import type { createEditorSchema } from "@/validators/forms/editor";
import type { ExceptionResponse } from "@/lib/api-client";

export interface EditorFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  preview: boolean;
  schedule: boolean;
  simulateFailure: boolean;
  onSetSchedule: (v: boolean) => void;
  onSetSimulateFailure: (v: boolean) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  t: Record<string, string>;
  editorSchemas: ReturnType<typeof createEditorSchema>;
  slugEditedByUser: React.MutableRefObject<boolean>;
  simulateError: (
    id: string,
    opts?: { failRate?: number; delayMs?: number },
  ) => Promise<ExceptionResponse>;
  allMessages: Record<string, unknown>;
  toast: (opts: {
    description: string;
    variant?: "default" | "destructive";
  }) => void;
}
