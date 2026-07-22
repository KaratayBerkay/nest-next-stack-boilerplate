/* eslint-disable @typescript-eslint/no-explicit-any */
import { Separator } from "@/components/ui/Separator";
import { Button } from "@/components/ui/Button";
import { blurAsyncCheck } from "@/lib/forms/blur-async-check";
import { TAKEN_SLUGS } from "./draft-utils";
import type { createEditorSchema } from "@/validators/forms/editor";
import type { ExceptionResponse } from "@/lib/api-client";

interface EditorFormFieldsProps {
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
  toast: (opts: { description: string; variant?: "default" | "destructive" }) => void;
}

export function EditorFormFields({
  form,
  preview,
  schedule,
  simulateFailure,
  onSetSchedule,
  onSetSimulateFailure,
  onSaveDraft,
  onPublish,
  onSchedule,
  t,
  editorSchemas,
  slugEditedByUser,
  simulateError,
  allMessages,
  toast,
}: EditorFormFieldsProps) {
  return (
    <>
      {!preview && (
        <>
          <form.AppField name="title" validators={{ onChange: editorSchemas.shape.title }}>
            {(field: any) => (
              <field.TextField label={t.title} placeholder={t.titlePlaceholder} />
            )}
          </form.AppField>

          <form.AppField
            name="slug"
            validators={{
              onChange: editorSchemas.shape.slug,
              onBlurAsyncDebounceMs: 300,
              onBlurAsync: async ({ value }: { value: string }) => {
                if (!value || !slugEditedByUser.current) return undefined;
                if (!TAKEN_SLUGS.has(value.toLowerCase())) return undefined;
                return blurAsyncCheck(value, "content-slug-taken", { simulateError, toast, allMessages });
              },
            }}
          >
            {(field: any) => <field.TextField label={t.slug} hint={t.slugHint} />}
          </form.AppField>

          <form.AppField name="tags">
            {(field: any) => <field.ComboboxField label={t.tags} options={[]} />}
          </form.AppField>

          <form.AppField name="body">
            {(field: any) => (
              <field.TextareaField label={t.body} placeholder={t.bodyPlaceholder} />
            )}
          </form.AppField>
        </>
      )}

      <Separator />

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={schedule} onChange={() => onSetSchedule(!schedule)} className="h-4 w-4" />
          {t.schedule}
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={simulateFailure} onChange={() => onSetSimulateFailure(!simulateFailure)} className="h-4 w-4" />
          {t.simulateFailure}
        </label>
      </div>

      {schedule && (
        <div className="grid grid-cols-2 gap-4">
          <form.AppField name="publishAt">
            {(field: any) => <field.DateField label={t.schedule} />}
          </form.AppField>
          <form.AppField name="publishTime">
            {(field: any) => <field.TimeField label={t.time} />}
          </form.AppField>
        </div>
      )}

      <Separator />

      <form.AppForm>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            {t.saveDraft}
          </Button>
          <form.SubmitButton label={t.publish} loadingLabel={t.publishing} onClick={onPublish} />
          {schedule && (
            <form.SubmitButton label={t.schedule} loadingLabel={t.scheduling} onClick={onSchedule} />
          )}
        </div>
      </form.AppForm>
    </>
  );
}
