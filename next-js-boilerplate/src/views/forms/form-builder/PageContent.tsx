"use client";

import { useCallback, useMemo, useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";

interface BuilderField {
  id: string;
  type: "text" | "select" | "checkbox" | "date";
  label: string;
  name: string;
  required: boolean;
  options: string[];
}

const RESERVED_NAMES = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "id",
  "form",
]);
const NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]{0,30}$/;

function sanitizeFieldName(label: string): string {
  let name = label.replace(/[^a-zA-Z0-9]/g, "").replace(/^(\d)/, "_$1");
  if (!name || RESERVED_NAMES.has(name) || !NAME_REGEX.test(name)) {
    name = `field_${Math.random().toString(36).slice(2, 8)}`;
  }
  return name;
}

let nextFieldId = 5;

const INITIAL_FIELDS: BuilderField[] = [
  {
    id: "1",
    type: "text",
    label: "Full Name",
    name: "fullName",
    required: true,
    options: [],
  },
  {
    id: "2",
    type: "select",
    label: "Country",
    name: "country",
    required: true,
    options: ["US", "Canada", "UK"],
  },
  {
    id: "3",
    type: "checkbox",
    label: "Newsletter",
    name: "newsletter",
    required: false,
    options: [],
  },
  {
    id: "4",
    type: "date",
    label: "Birth Date",
    name: "birthDate",
    required: false,
    options: [],
  },
];

const FIELD_TYPES: { value: BuilderField["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
];

export default function FormBuilderPage() {
  const t = useMessages("forms");
  const { toast } = useToast();
  const [fields, setFields] = useState<BuilderField[]>(INITIAL_FIELDS);
  const [preview, setPreview] = useState(false);

  const handleAddField = useCallback(() => {
    const label = "New Field";
    setFields((prev) => [
      ...prev,
      {
        id: String(nextFieldId++),
        type: "text",
        label,
        name: sanitizeFieldName(label),
        required: false,
        options: [],
      },
    ]);
  }, []);

  const handleRemoveField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleMoveUp = useCallback((idx: number) => {
    if (idx === 0) return;
    setFields((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((idx: number) => {
    setFields((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleUpdateField = useCallback(
    (id: string, patch: Partial<BuilderField>) => {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const updated = { ...f, ...patch };
          if (patch.label && patch.label !== f.label) {
            updated.name = sanitizeFieldName(patch.label);
          }
          return updated;
        }),
      );
    },
    [],
  );

  const handleExport = useCallback(() => {
    const config = JSON.stringify(fields, null, 2);
    navigator.clipboard.writeText(config).then(() => {
      toast({ description: t.formBuilder.configCopied, variant: "default" });
    });
  }, [fields, toast, t]);

  const dynamicDefaultValues = useMemo(
    () =>
      Object.fromEntries(
        fields.map((f) => [f.name, f.type === "checkbox" ? false : ""]),
      ),
    [fields],
  );

  const dynamicFormOptions = useMemo(
    () =>
      formOptions({
        defaultValues: dynamicDefaultValues as Record<string, string | boolean>,
      }),
    [dynamicDefaultValues],
  );

  const dynamicForm = useAppForm(dynamicFormOptions);

  const handlePreviewSubmit = useCallback(() => {
    toast({
      description: `Form submitted: ${JSON.stringify(dynamicForm.state.values)}`,
      variant: "default",
    });
  }, [toast, dynamicForm.state.values]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{t.formBuilder.heading}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={preview ? "secondary" : "default"}
            onClick={() => setPreview(false)}
          >
            {t.formBuilder.builder}
          </Button>
          <Button
            size="sm"
            variant={preview ? "default" : "secondary"}
            onClick={() => setPreview(true)}
          >
            {t.formBuilder.preview}
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="flex flex-col gap-4">
          <p className="text-xxs text-muted">
            {t.formBuilder.fieldNamesLabel} {fields.map((f) => f.name).join(", ")}
          </p>
          {fields.map((field) => (
            <dynamicForm.AppField key={field.id} name={field.name}>
              {(f) => (
                <div className="flex flex-col gap-1">
                  {field.type === "text" && <f.TextField label={field.label} />}
                  {field.type === "select" && (
                    <f.SelectField
                      label={field.label}
                      options={field.options.map((o) => ({
                        value: o,
                        label: o,
                      }))}
                    />
                  )}
                  {field.type === "checkbox" && (
                    <f.CheckboxField
                      label={field.label}
                      options={[{ value: "true", label: field.label }]}
                    />
                  )}
                  {field.type === "date" && <f.DateField label={field.label} />}
                </div>
              )}
            </dynamicForm.AppField>
          ))}
          <Button onClick={handlePreviewSubmit}>
            {t.formBuilder.submitPreview}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="surface border-border flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {field.label || t.formBuilder.untitledField}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                  >
                    {t.formBuilder.moveUp}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={idx >= fields.length - 1}
                    onClick={() => handleMoveDown(idx)}
                  >
                    {t.formBuilder.moveDown}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveField(field.id)}
                  >
                    {t.formBuilder.removeField}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xxs text-muted">
                    {t.formBuilder.fieldType}
                  </span>
                  <select
                    className="border-border bg-field rounded border px-2 py-1 text-xs"
                    value={field.type}
                    onChange={(e) =>
                      handleUpdateField(field.id, {
                        type: e.target.value as BuilderField["type"],
                      })
                    }
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>
                        {ft.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xxs text-muted">
                    {t.formBuilder.fieldLabel}
                  </span>
                  <input
                    className="border-border bg-field rounded border px-2 py-1 text-xs"
                    value={field.label}
                    onChange={(e) =>
                      handleUpdateField(field.id, { label: e.target.value })
                    }
                  />
                </div>
              </div>
              {field.type === "select" && (
                <div className="flex flex-col gap-1">
                  <span className="text-xxs text-muted">
                    {t.formBuilder.fieldOptions}
                  </span>
                  <input
                    className="border-border bg-field rounded border px-2 py-1 text-xs"
                    placeholder={t.formBuilder.optionsPlaceholder}
                    value={field.options.join(", ")}
                    onChange={(e) =>
                      handleUpdateField(field.id, {
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              )}
              <label className="text-xxs flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    handleUpdateField(field.id, { required: e.target.checked })
                  }
                />
                {t.formBuilder.fieldRequired}
              </label>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddField}>
            {t.formBuilder.addField}
          </Button>

          <Separator />

          <Button variant="outline" size="sm" onClick={handleExport}>
            {t.formBuilder.exportConfig}
          </Button>
        </div>
      )}
    </div>
  );
}
