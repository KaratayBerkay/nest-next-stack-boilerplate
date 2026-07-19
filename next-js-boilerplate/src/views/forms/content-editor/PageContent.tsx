"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";

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

const DRAFT_KEY = "forms:draft";
const DRAFT_SIZE_CAP = 50_000;

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (new Date(parsed.savedAt).getTime() < Date.now() - 86400000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(values: DraftValues) {
  try {
    const data = JSON.stringify({ ...values, savedAt: Date.now() });
    if (data.length > DRAFT_SIZE_CAP) return;
    localStorage.setItem(DRAFT_KEY, data);
  } catch {
    /* quota exceeded */
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
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
  },
});

export default function ContentEditorPage() {
  const t = useMessages("forms");
  const { toast } = useToast();
  const [preview, setPreview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftAlert, setDraftAlert] = useState<Draft | null>(() => loadDraft());
  const dirtyRef = useRef(false);
  const slugEditedByUser = useRef(false);
  const [schedule, setSchedule] = useState(false);

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
      await new Promise((r) => setTimeout(r, 1000));
      toast({
        description: meta?.intent === "schedule" ? t.contentEditor.scheduled : t.contentEditor.published,
        variant: "default",
      });
      dirtyRef.current = false;
      return null;
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
    const handler = () => clearDraft();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const handleSaveDraft = useCallback(() => {
    const { title, slug, tags, body } = form.state.values;
    saveDraft({ title, slug, tags, body });
    dirtyRef.current = false;
    toast({ description: t.contentEditor.draftSaved, variant: "default" });
  }, [form.state.values, toast, t]);

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
    clearDraft();
    setDraftAlert(null);
  }, []);

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
            <form.AppField name="title">
              {(field) => <field.TextField label={t.contentEditor.title} placeholder={t.contentEditor.titlePlaceholder} />}
            </form.AppField>

            <form.AppField name="slug">
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

        <div className="flex items-center gap-2">
          <input type="checkbox" id="schedule" checked={schedule} onChange={() => setSchedule((s) => !s)} className="h-4 w-4" />
          <label htmlFor="schedule" className="text-xs">{t.contentEditor.schedule}</label>
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
