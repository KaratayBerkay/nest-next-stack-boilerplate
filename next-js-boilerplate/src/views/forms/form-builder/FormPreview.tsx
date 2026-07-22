import type { BuilderField } from "@/types/forms/BuilderField-types";
import type { useMessages } from "@/lib/i18n/MessagesProvider";
import type { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";

interface FormPreviewProps {
  fields: BuilderField[];
  dynamicForm: ReturnType<typeof useAppForm>;
  onSubmit: () => void;
  t: ReturnType<typeof useMessages<"forms">>;
}

export function FormPreview({ fields, dynamicForm, onSubmit, t }: FormPreviewProps) {
  return (
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
      <Button onClick={onSubmit}>
        {t.formBuilder.submitPreview}
      </Button>
    </div>
  );
}
