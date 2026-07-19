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

function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem("editor-draft");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(values: { title: string; slug: string; tags: string[]; body: string }) {
  sessionStorage.setItem("editor-draft", JSON.stringify({ ...values, savedAt: Date.now() }));
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
  const [draftAlert, setDraftAlert] = useState<Draft | null>(() => {
    const draft = loadDraft();
    if (draft && draft.savedAt > Date.now() - 86400000) return draft;
    return null;
  });
  const dirtyRef = useRef(false);
  const slugEditedByUser = useRef(false);
  const [schedule, setSchedule] = useState(false);

  const form = useAppForm({
    ...editorFormOpts,
    validators: {
      onChange: () => {
        dirtyRef.current = true;
        return undefined;
      },
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

  const handleSaveDraft = useCallback(() => {
    saveDraft(form.state.values);
    dirtyRef.current = false;
    toast({ description: t.contentEditor.draftSaved, variant: "default" });
  }, [form.state.values, toast, t]);

  const handlePublish = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1000));
    toast({ description: t.contentEditor.published, variant: "default" });
    dirtyRef.current = false;
  }, [toast, t]);

  const handleRestore = useCallback(() => {
    if (!draftAlert) return;
    form.setFieldValue("title", draftAlert.title);
    form.setFieldValue("slug", draftAlert.slug);
    form.setFieldValue("tags", draftAlert.tags);
    form.setFieldValue("body", draftAlert.body);
    toast({ description: t.contentEditor.draftRestored.replace("{time}", new Date(draftAlert.savedAt).toLocaleString()), variant: "default" });
    setDraftAlert(null);
  }, [draftAlert, form, toast, t]);

  const handleDiscard = useCallback(() => {
    sessionStorage.removeItem("editor-draft");
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
          <Button type="button" onClick={handlePublish}>{t.contentEditor.publish}</Button>
        </div>
      </form>
    </div>
  );
}
