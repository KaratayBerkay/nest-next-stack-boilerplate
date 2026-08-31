"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { StateCard } from "./StateCard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleSetError(form: any, serverRejectedError: string) {
  form.setFieldMeta(
    "metaField",
    (prev: { errors: string[]; isValidating: boolean }) => ({
      ...prev,
      errors: [serverRejectedError],
      isValidating: false,
    }),
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleSetValidating(form: any) {
  form.setFieldMeta(
    "metaField",
    (prev: { errors: string[]; isValidating: boolean }) => ({
      ...prev,
      errors: [],
      isValidating: true,
    }),
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleClear(form: any) {
  form.setFieldMeta(
    "metaField",
    (prev: { errors: string[]; isValidating: boolean }) => ({
      ...prev,
      errors: [],
      isValidating: false,
    }),
  );
}

export function ProgrammaticMetaSection() {
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: { metaField: "" },
  });

  return (
    <div className="surface border-border flex flex-col gap-4 rounded-lg border p-4">
      <p className="text-xs font-medium">{t.fieldStates.metaSectionTitle}</p>
      <p className="text-xxs text-muted">
        {t.fieldStates.metaDescriptionPrefix} <code>form.setFieldMeta</code>{" "}
        {t.fieldStates.metaDescriptionSuffix}
      </p>

      <form.AppField name="metaField">
        {(field) => (
          <div className="flex flex-col gap-2">
            <field.TextField label={t.fieldStates.targetFieldLabel} />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleSetError(form, t.fieldStates.serverRejectedError)
                }
              >
                {t.fieldStates.setErrorButton}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSetValidating(form)}
              >
                {t.fieldStates.setValidatingButton}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleClear(form)}
              >
                {t.fieldStates.clearButton}
              </Button>
            </div>

            <div className="border-border bg-bg text-xxs mt-2 rounded border p-2 font-mono">
              <div>errors: {JSON.stringify(field.state.meta.errors)}</div>
              <div>isValidating: {String(field.state.meta.isValidating)}</div>
              <div>
                aria-invalid: {String(field.state.meta.errors.length > 0)}
              </div>
            </div>
          </div>
        )}
      </form.AppField>

      <div className="flex flex-wrap gap-2">
        <StateCard label={t.fieldStates.ariaInvalidExampleLabel}>
          <Label htmlFor="a11y-invalid">
            {t.fieldStates.invalidInputLabel}
          </Label>
          <Input
            id="a11y-invalid"
            aria-invalid
            placeholder={t.fieldStates.ariaInvalidPlaceholder}
          />
        </StateCard>
        <StateCard label={t.fieldStates.ariaDescribedbyExampleLabel}>
          <Label htmlFor="a11y-desc">{t.fieldStates.describedInputLabel}</Label>
          <Input
            id="a11y-desc"
            aria-describedby="desc-field-states"
            placeholder={t.fieldStates.linkedPlaceholder}
          />
          <p id="desc-field-states" className="text-xxs text-muted">
            {t.fieldStates.describedByText}
          </p>
        </StateCard>
      </div>
    </div>
  );
}
