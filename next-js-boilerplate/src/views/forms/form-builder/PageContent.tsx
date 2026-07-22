"use client";

import { useCallback, useMemo, useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import type { BuilderField } from "@/types/forms/BuilderField-types";
import { sanitizeFieldName, getNextFieldId, INITIAL_FIELDS } from "@/views/forms/form-builder/FormBuilder-utils";
import { FormPreview } from "@/views/forms/form-builder/FormPreview";
import { FieldEditor } from "@/views/forms/form-builder/FieldEditor";

export default function FormBuilderPage() {
  const t = useMessages("forms");
  const { toast } = useToast();
  const [fields, setFields] = useState<BuilderField[]>(INITIAL_FIELDS);
  const [preview, setPreview] = useState(false);

  const handleAddField = useCallback(() => {
    const label = "New Field";
    setFields((prev) => [...prev, { id: getNextFieldId(), type: "text", label, name: sanitizeFieldName(label), required: false, options: [] }]);
  }, []);

  const handleRemoveField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleMoveUp = useCallback((idx: number) => {
    if (idx === 0) return;
    setFields((prev) => { const next = [...prev]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; return next; });
  }, []);

  const handleMoveDown = useCallback((idx: number) => {
    setFields((prev) => { if (idx >= prev.length - 1) return prev; const next = [...prev]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; return next; });
  }, []);

  const handleUpdateField = useCallback((id: string, patch: Partial<BuilderField>) => {
    setFields((prev) => prev.map((f) => {
      if (f.id !== id) return f;
      const updated = { ...f, ...patch };
      if (patch.label && patch.label !== f.label) updated.name = sanitizeFieldName(patch.label);
      return updated;
    }));
  }, []);

  const handleExport = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(fields, null, 2)).then(() => {
      toast({ description: t.formBuilder.configCopied, variant: "default" });
    });
  }, [fields, toast, t]);

  const dynamicDefaultValues = useMemo(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.type === "checkbox" ? false : ""])),
    [fields],
  );

  const dynamicFormOptions = useMemo(() =>
    formOptions({ defaultValues: dynamicDefaultValues as Record<string, string | boolean> }),
    [dynamicDefaultValues],
  );

  const dynamicForm = useAppForm(dynamicFormOptions);

  const handlePreviewSubmit = useCallback(() => {
    toast({ description: `Form submitted: ${JSON.stringify(dynamicForm.state.values)}`, variant: "default" });
  }, [toast, dynamicForm.state.values]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t.formBuilder.heading}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant={preview ? "secondary" : "default"} onClick={() => setPreview(false)}>
            {t.formBuilder.builder}
          </Button>
          <Button size="sm" variant={preview ? "default" : "secondary"} onClick={() => setPreview(true)}>
            {t.formBuilder.preview}
          </Button>
        </div>
      </div>
      {preview ? (
        <FormPreview fields={fields} dynamicForm={dynamicForm as unknown as ReturnType<typeof useAppForm>} onSubmit={handlePreviewSubmit} t={t} />
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, idx) => (
            <FieldEditor
              key={field.id}
              field={field}
              idx={idx}
              fieldsLength={fields.length}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onRemove={handleRemoveField}
              onUpdate={handleUpdateField}
              t={t}
            />
          ))}
          <Button variant="outline" size="sm" onClick={handleAddField}>{t.formBuilder.addField}</Button>
          <Separator />
          <Button variant="outline" size="sm" onClick={handleExport}>{t.formBuilder.exportConfig}</Button>
        </div>
      )}
    </div>
  );
}
