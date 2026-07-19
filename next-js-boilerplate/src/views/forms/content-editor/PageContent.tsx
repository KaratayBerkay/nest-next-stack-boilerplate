"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { exceptionHandler } from "@/lib/exception-handler";
import { z } from "zod";
import { editorSchema, createEditorSchema } from "@/validators/forms/editor";
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

function deriveSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const editorFormOpts = formOptions({
  defaultValues: {
    title: "",
    slug: "",
    tags: [] as string[],
    body: "",
    publishAt: undefined as Date | undefined,
    publishTime: { hours: 0, minutes: 0, seconds: 0 },
  } satisfies z.input<typeof editorSchema>,
});

export default function ContentEditorPage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { user } = useAuth();
  const { simulateError } = useFormsDemoActions();
  const draftKey = DRAFT_KEY_PREFIX + (user?.id ?? "anonymous");
  const [preview, setPreview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftAlert, setDraftAlert] = useState<Draft | null>(() => loadDraft(draftKey));
  const dirtyRef = useRef(false);
  const slugEditedByUser = useRef(false);
  const [schedule, setSchedule] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const editorSchemas = useMemo(() => createEditorSchema(t.contentEditor), [t]);

  const form = useAppForm({
    ...editorFormOpts,
    onSubmitMeta: {} as { intent: "publish" | "schedule" },
    validators: {
      onChange: () => {
        dirtyRef.current = true;
        return undefined;
      },
    },
    onSubmit: async ({ value, meta }) => {
      if (meta?.intent === "schedule" && !value.publishAt) {
        return { form: "Schedule date is required", fields: {} };
      }
      try {
        await simulateError("internal-error", { failRate: simulateFailure ? 1 : 0, delayMs: 600 });
        toast({
          description: meta?.intent === "schedule" ? t.contentEditor.scheduled : t.contentEditor.published,
          variant: "default",
        });
        dirtyRef.current = false;
        clearDraft(draftKey);
        return null;
      } catch (err) {
        const exc = (err as { exception?: ExceptionResponse }).exception;
        if (exc) {
          toast({ description: exceptionHandler(exc, allMessages), variant: "destructive" });
        }
        return null;
      }
    },
  });

  useEffect(() => {
    if (form.state.values.title && !slugEditedByUser.current) {
      const derived = deriveSlug(form.state.values.title);
      form.setFieldValue("slug", derived);
    }
  }, [form.state.values.title, form]);

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
      if (draftKey && form.state.values.title) {
        saveDraft(draftKey, {
          title: form.state.values.title,
          slug: form.state.values.slug,
          tags: form.state.values.tags,
          body: form.state.values.body,
        });
      }
    };
    const interval = setInterval(handler, 30000);
    return () => clearInterval(interval);
  }, [draftKey, form.state.values]);

  const handleSaveDraft = useCallback(() => {
    const { title, slug, tags, body } = form.state.values;
    saveDraft(draftKey, { title, slug, tags, body });
    dirtyRef.current = false;
    toast({ description: t.contentEditor.draftSaved, variant: "default" });
  }, [form.state.values, toast, t, draftKey]);

  const handleRestore = useCallback(() => {
    if (!draftAlert) return;
    form.setFieldValue("title", draftAlert.title);
    form.setFieldValue("slug", draftAlert.slug);
    form.setFieldValue("tags", draftAlert.tags);
    form.setFieldValue("body", draftAlert.body);
    toast({
      description: t.contentEditor.draftRestored.replace("{time}", new Date(draftAlert.savedAt).toLocaleString()),
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
          <Button size="sm" variant={preview ? "secondary" : "default"} onClick={() => setPreview(false)}>{t.contentEditor.edit}</Button>
          <Button size="sm" variant={preview ? "default" : "secondary"} onClick={() => setPreview(true)}>{t.contentEditor.preview}</Button>
        </div>
      </div>

      {formError && <FormErrorBanner message={formError} onDismiss={() => setFormError(null)} />}

      {draftAlert && (
        <div className="surface flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-xs">{t.contentEditor.draftRestored.replace("{time}", new Date(draftAlert.savedAt).toLocaleString())}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDiscard}>{t.contentEditor.draftDiscard}</Button>
            <Button size="sm" onClick={handleRestore}>{t.contentEditor.draftRestore}</Button>
          </div>
        </div>
      )}

      <form className="flex flex-col gap-4">
        {preview ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{form.state.values.title || "Untitled"}</h1>
            <div className="flex flex-wrap gap-1">
              {form.state.values.tags.map((tag, i) => (
                <span key={i} className="rounded bg-emphasis px-1.5 py-0.5 text-xxs">{tag}</span>
              ))}
            </div>
            <p className="whitespace-pre-wrap text-sm">{form.state.values.body}</p>
          </div>
        ) : (
          <>
            <form.AppField name="title" validators={{ onChange: editorSchemas.shape.title }}>
              {(field) => <field.TextField label={t.contentEditor.title} placeholder={t.contentEditor.titlePlaceholder} />}
            </form.AppField>

            <form.AppField name="slug" validators={{ onChange: editorSchemas.shape.slug }}>
              {(field) => <field.TextField label={t.contentEditor.slug} />}
            </form.AppField>

            <form.AppField name="tags">
              {(field) => <field.ComboboxField label={t.contentEditor.tags} options={[]} />}
            </form.AppField>

            <form.AppField name="body">
              {(field) => (
                <field.TextareaField label={t.contentEditor.body} placeholder={t.contentEditor.bodyPlaceholder} />
              )}
            </form.AppField>
          </>
        )}

        <Separator />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="schedule" checked={schedule} onChange={() => setSchedule((s) => !s)} className="h-4 w-4" />
            <label htmlFor="schedule" className="text-xs">{t.contentEditor.schedule}</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="simulate-failure" checked={simulateFailure} onChange={() => setSimulateFailure((s) => !s)} className="h-4 w-4" />
            <label htmlFor="simulate-failure" className="text-xs">{t.contentEditor.simulateFailure}</label>
          </div>
        </div>

        {schedule && (
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="publishAt">
              {(field) => <field.DateField label={t.contentEditor.schedule} />}
            </form.AppField>
            <form.AppField name="publishTime">
              {(field) => <field.TimeField label="Time" />}
            </form.AppField>
          </div>
        )}

        <Separator />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>{t.contentEditor.saveDraft}</Button>
          <Button type="button" onClick={() => form.handleSubmit({ intent: "publish" })}>{t.contentEditor.publish}</Button>
          {schedule && (
            <Button type="button" onClick={() => form.handleSubmit({ intent: "schedule" })}>{t.contentEditor.schedule}</Button>
          )}
        </div>
      </form>
    </div>
  );
}
