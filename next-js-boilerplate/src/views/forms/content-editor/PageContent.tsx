"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions, useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Separator } from "@/components/ui/Separator";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { exceptionHandler } from "@/lib/exception-handler";
import { blurAsyncCheck } from "@/lib/forms/blur-async-check";
import { createEditorSchema } from "@/validators/forms/editor";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { editorDefaultValues } from "@/validators/forms/editor-inits";
import type { ExceptionResponse } from "@/lib/api-client";

interface Draft {
  title: string;
  slug: string;
  tags: string[];
  body: string;
  savedAt: number;
}

interface DraftValues {
  title: string;
  slug: string;
  tags: string[];
  body: string;
}

const DRAFT_KEY_PREFIX = "forms:draft:";
const DRAFT_SIZE_CAP = 50_000;

function loadDraft(key: string): Draft | null {
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

function saveDraft(key: string, values: DraftValues) {
  try {
    const data = JSON.stringify({ ...values, savedAt: Date.now() });
    if (data.length > DRAFT_SIZE_CAP) return;
    localStorage.setItem(key, data);
  } catch {
    /* quota exceeded */
  }
}

function clearDraft(key: string) {
  localStorage.removeItem(key);
}

const TAKEN_SLUGS = new Set(["getting-started", "hello-world"]);

function deriveSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function submitContent(
  { value }: { value: typeof editorFormOpts.defaultValues },
  deps: {
    simulateError: (
      id: string,
      opts?: { failRate?: number; delayMs?: number },
    ) => Promise<ExceptionResponse>;
    scheduleDateRequired: string;
    failRate: number;
    intent: "publish" | "schedule";
    unknownError: string;
  },
) {
  if (deps.intent === "schedule" && !value.publishAt) {
    return { form: deps.scheduleDateRequired, fields: {} };
  }
  try {
    await deps.simulateError("internal-error", {
      failRate: deps.failRate,
      delayMs: 600,
    });
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (exc) return { form: exceptionHandler(exc, {}), fields: {} };
    return { form: deps.unknownError, fields: {} };
  }
}

const editorFormOpts = formOptions({
  defaultValues: editorDefaultValues,
});

export default function ContentEditorPage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { user } = useAuth();
  const { simulateError } = useFormsDemoActions();
  const draftKey = DRAFT_KEY_PREFIX + (user?.id ?? "anonymous");
  const [preview, setPreview] = useState(false);
  const [draftAlert, setDraftAlert] = useState<Draft | null>(() =>
    loadDraft(draftKey),
  );
  const dirtyRef = useRef(false);
  const slugEditedByUser = useRef(false);
  const [schedule, setSchedule] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const submitIntentRef = useRef<"publish" | "schedule">("publish");
  const editorSchemas = useMemo(() => createEditorSchema(t.contentEditor), [t]);

  const form = useAppForm({
    ...editorFormOpts,
    validators: {
      onChange: () => {
        dirtyRef.current = true;
        return undefined;
      },
      onSubmitAsync: ({ value }) =>
        submitContent(
          { value },
          {
            simulateError,
            scheduleDateRequired: t.contentEditor.scheduleDateRequired,
            failRate: simulateFailure ? 1 : 0,
            intent: submitIntentRef.current,
            unknownError: t.errors.unknown,
          },
        ),
    },
    onSubmit: async () => {
      toast({
        description:
          submitIntentRef.current === "schedule"
            ? t.contentEditor.scheduled
            : t.contentEditor.published,
        variant: "default",
      });
      dirtyRef.current = false;
      clearDraft(draftKey);
    },
  });

  const values = useStore(form.store, (s) => ({
    title: s.values.title,
    slug: s.values.slug,
    tags: s.values.tags,
    body: s.values.body,
  }));

  useEffect(() => {
    if (values.title && !slugEditedByUser.current) {
      const derived = deriveSlug(values.title);
      form.setFieldValue("slug", derived);
    }
  }, [values.title, form]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form]);

  useEffect(() => {
    const handler = () => clearDraft(draftKey);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [draftKey]);

  useEffect(() => {
    const handler = () => {
      if (draftKey && values.title) {
        saveDraft(draftKey, {
          title: values.title,
          slug: values.slug,
          tags: values.tags,
          body: values.body,
        });
      }
    };
    const interval = setInterval(handler, 30000);
    return () => clearInterval(interval);
  }, [draftKey, values]);

  const handleSaveDraft = useCallback(() => {
    saveDraft(draftKey, {
      title: values.title,
      slug: values.slug,
      tags: values.tags,
      body: values.body,
    });
    dirtyRef.current = false;
    toast({ description: t.contentEditor.draftSaved, variant: "default" });
  }, [values, toast, t, draftKey]);

  const handleRestore = useCallback(() => {
    if (!draftAlert) return;
    form.setFieldValue("title", draftAlert.title);
    form.setFieldValue("slug", draftAlert.slug);
    form.setFieldValue("tags", draftAlert.tags);
    form.setFieldValue("body", draftAlert.body);
    toast({
      description: t.contentEditor.draftRestored.replace(
        "{time}",
        new Date(draftAlert.savedAt).toLocaleString(),
      ),
      variant: "default",
    });
    setDraftAlert(null);
  }, [draftAlert, form, toast, t]);

  const handleDiscard = useCallback(() => {
    clearDraft(draftKey);
    setDraftAlert(null);
  }, [draftKey]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{t.contentEditor.heading}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={preview ? "secondary" : "default"}
            onClick={() => setPreview(false)}
          >
            {t.contentEditor.edit}
          </Button>
          <Button
            size="sm"
            variant={preview ? "default" : "secondary"}
            onClick={() => setPreview(true)}
          >
            {t.contentEditor.preview}
          </Button>
        </div>
      </div>

      {draftAlert && (
        <div className="surface border-border flex items-center justify-between rounded-lg border p-3">
          <span className="text-xs">
            {t.contentEditor.draftRestored.replace(
              "{time}",
              new Date(draftAlert.savedAt).toLocaleString(),
            )}
          </span>
          <div className="flex gap-2">
            <ConfirmDialog
              title={t.contentEditor.draftDiscard}
              description={t.contentEditor.draftDiscardConfirm}
              confirmLabel={t.contentEditor.draftDiscard}
              onConfirm={handleDiscard}
            >
              {(open) => (
                <Button size="sm" variant="outline" onClick={open}>
                  {t.contentEditor.draftDiscard}
                </Button>
              )}
            </ConfirmDialog>
            <Button size="sm" onClick={handleRestore}>
              {t.contentEditor.draftRestore}
            </Button>
          </div>
        </div>
      )}

      <FormLevelError form={form} />
      <form className="flex flex-col gap-4">
        {preview ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold">
              {values.title || t.contentEditor.untitled}
            </h1>
            <div className="flex flex-wrap gap-1">
              {values.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-emphasis text-xxs rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm whitespace-pre-wrap">{values.body}</p>
          </div>
        ) : (
          <>
            <form.AppField
              name="title"
              validators={{ onChange: editorSchemas.shape.title }}
            >
              {(field) => (
                <field.TextField
                  label={t.contentEditor.title}
                  placeholder={t.contentEditor.titlePlaceholder}
                />
              )}
            </form.AppField>

            <form.AppField
              name="slug"
              validators={{
                onChange: editorSchemas.shape.slug,
                onBlurAsyncDebounceMs: 300,
                onBlurAsync: async ({ value }) => {
                  if (!value || !slugEditedByUser.current) return undefined;
                  if (!TAKEN_SLUGS.has(value.toLowerCase())) return undefined;
                  return blurAsyncCheck(value, "content-slug-taken", { simulateError, toast, allMessages });
                },
              }}
            >
              {(field) => <field.TextField label={t.contentEditor.slug} hint={t.contentEditor.slugHint} />}
            </form.AppField>

            <form.AppField name="tags">
              {(field) => (
                <field.ComboboxField
                  label={t.contentEditor.tags}
                  options={[]}
                />
              )}
            </form.AppField>

            <form.AppField name="body">
              {(field) => (
                <field.TextareaField
                  label={t.contentEditor.body}
                  placeholder={t.contentEditor.bodyPlaceholder}
                />
              )}
            </form.AppField>
          </>
        )}

        <Separator />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="schedule"
              checked={schedule}
              onChange={() => setSchedule((s) => !s)}
              className="h-4 w-4"
            />
            <label htmlFor="schedule" className="text-xs">
              {t.contentEditor.schedule}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="simulate-failure"
              checked={simulateFailure}
              onChange={() => setSimulateFailure((s) => !s)}
              className="h-4 w-4"
            />
            <label htmlFor="simulate-failure" className="text-xs">
              {t.contentEditor.simulateFailure}
            </label>
          </div>
        </div>

        {schedule && (
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="publishAt">
              {(field) => <field.DateField label={t.contentEditor.schedule} />}
            </form.AppField>
            <form.AppField name="publishTime">
              {(field) => <field.TimeField label={t.contentEditor.time} />}
            </form.AppField>
          </div>
        )}

        <Separator />

        <form.AppForm>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleSaveDraft}>
              {t.contentEditor.saveDraft}
            </Button>
            <form.SubmitButton
              label={t.contentEditor.publish}
              loadingLabel={t.contentEditor.publishing}
              onClick={() => {
                submitIntentRef.current = "publish";
                form.handleSubmit();
              }}
            />
            {schedule && (
              <form.SubmitButton
                label={t.contentEditor.schedule}
                loadingLabel={t.contentEditor.scheduling}
                onClick={() => {
                  submitIntentRef.current = "schedule";
                  form.handleSubmit();
                }}
              />
            )}
          </div>
        </form.AppForm>
      </form>
    </div>
  );
}
