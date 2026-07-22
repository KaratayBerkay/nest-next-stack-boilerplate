"use client";

import { useAppForm } from "@/features/forms/form-hook";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { StateCard } from "./StateCard";

export function ProgrammaticMetaSection() {
  const form = useAppForm({
    defaultValues: { metaField: "" },
  });

  const handleSetError = () => {
    form.setFieldMeta("metaField", (prev) => ({
      ...prev,
      errors: ["Server rejected this value"],
      isValidating: false,
    }));
  };

  const handleSetValidating = () => {
    form.setFieldMeta("metaField", (prev) => ({
      ...prev,
      errors: [],
      isValidating: true,
    }));
  };

  const handleClear = () => {
    form.setFieldMeta("metaField", (prev) => ({
      ...prev,
      errors: [],
      isValidating: false,
    }));
  };

  return (
    <div className="surface border-border flex flex-col gap-4 rounded-lg border p-4">
      <p className="text-xs font-medium">Programmatic Field Meta</p>
      <p className="text-xxs text-muted">
        Setting meta via <code>form.setFieldMeta</code> — server errors,
        validating state.
      </p>

      <form.AppField name="metaField">
        {(field) => (
          <div className="flex flex-col gap-2">
            <field.TextField label="Target field" />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSetError}
              >
                Set Error
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSetValidating}
              >
                Set Validating
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClear}
              >
                Clear
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
        <StateCard label="aria-invalid example">
          <Label htmlFor="a11y-invalid">Invalid input</Label>
          <Input
            id="a11y-invalid"
            aria-invalid
            placeholder="aria-invalid on this"
          />
        </StateCard>
        <StateCard label="aria-describedby example">
          <Label htmlFor="a11y-desc">Described input</Label>
          <Input
            id="a11y-desc"
            aria-describedby="desc-field-states"
            placeholder="Linked to description"
          />
          <p id="desc-field-states" className="text-xxs text-muted">
            This description is linked via aria-describedby
          </p>
        </StateCard>
      </div>
    </div>
  );
}
