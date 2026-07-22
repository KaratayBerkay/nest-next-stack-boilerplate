"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { createEditorSchema } from "@/validators/forms/editor";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { draftKey, loadDraft, saveDraft, clearDraft, type Draft } from "./draft-utils";
import { editorFormOpts, submitContent } from "./submit-content";
import { EditorHeader } from "./EditorHeader";
import { DraftAlert } from "./DraftAlert";
import { EditorEffects } from "./EditorEffects";
import { EditorPreview } from "./EditorPreview";
import { EditorFormFields } from "./EditorFormFields";

export default function ContentEditorPage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { user } = useAuth();
  const { simulateError } = useFormsDemoActions();
  const dk = draftKey(user?.id);
  const [preview, setPreview] = useState(false);
  const [draftAlert, setDraftAlert] = useState<Draft | null>(() => loadDraft(dk));
  const dirtyRef = useRef(false);
  const slugEditedByUser = useRef(false);
  const [schedule, setSchedule] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const submitIntentRef = useRef<"publish" | "schedule">("publish");
  const editorSchemas = useMemo(() => createEditorSchema(t.contentEditor), [t]);

  const form = useAppForm({
    ...editorFormOpts,
    validators: {
      onChange: () => { dirtyRef.current = true; return undefined; },
      onSubmitAsync: ({ value }) =>
        submitContent({ value }, {
          simulateError,
          scheduleDateRequired: t.contentEditor.scheduleDateRequired,
          failRate: simulateFailure ? 1 : 0,
          intent: submitIntentRef.current,
          unknownError: t.errors.unknown,
        }),
    },
    onSubmit: async () => {
      toast({
        description: submitIntentRef.current === "schedule"
          ? t.contentEditor.scheduled : t.contentEditor.published,
        variant: "default",
      });
      dirtyRef.current = false;
      clearDraft(dk);
    },
  });

  const values = useStore(form.store, (s) => ({
    title: s.values.title, slug: s.values.slug, tags: s.values.tags, body: s.values.body,
  }));

  const handleSaveDraft = useCallback(() => {
    saveDraft(dk, { title: values.title, slug: values.slug, tags: values.tags, body: values.body });
    dirtyRef.current = false;
    toast({ description: t.contentEditor.draftSaved, variant: "default" });
  }, [values, toast, t, dk]);

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

  const handleDiscard = useCallback(() => { clearDraft(dk); setDraftAlert(null); }, [dk]);
  const ce = t.contentEditor;

  return (
    <div className="flex flex-col gap-6">
      <EditorEffects draftKey={dk} values={values} formSetFieldValue={form.setFieldValue} dirtyRef={dirtyRef} slugEditedByUser={slugEditedByUser} />
      <EditorHeader heading={ce.heading} editLabel={ce.edit} previewLabel={ce.preview} preview={preview} onToggle={setPreview} />
      {draftAlert && (
        <DraftAlert draft={draftAlert} restoreLabel={ce.draftRestored} discardLabel={ce.draftDiscard} discardConfirmLabel={ce.draftDiscardConfirm} onRestore={handleRestore} onDiscard={handleDiscard} />
      )}
      <FormLevelError form={form} />
      <form className="flex flex-col gap-4">
        {preview && <EditorPreview title={values.title} tags={values.tags} body={values.body} untitledLabel={ce.untitled} />}
        <EditorFormFields
          form={form} preview={preview} schedule={schedule} simulateFailure={simulateFailure}
          onSetSchedule={setSchedule} onSetSimulateFailure={setSimulateFailure}
          onSaveDraft={handleSaveDraft} t={ce} editorSchemas={editorSchemas}
          slugEditedByUser={slugEditedByUser} simulateError={simulateError}
          allMessages={allMessages} toast={toast}
          onPublish={() => { submitIntentRef.current = "publish"; form.handleSubmit(); }}
          onSchedule={() => { submitIntentRef.current = "schedule"; form.handleSubmit(); }}
        />
      </form>
    </div>
  );
}
