"use client";

import { useEffect } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { Input } from "@/components/ui/Input";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import { fieldStateErrorSchema } from "@/validators/env/schema";
import { StateCard } from "./StateCard";

export function FieldStatesGrid() {
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: {
      defaultField: "",
      filledField: "Some value",
      errorField: "ab",
      warningField: "Edge case",
      disabledField: "Cannot edit",
      loadingField: "checking...",
      readOnlyField: "Read-only value",
      requiredField: "",
    },
  });

  useEffect(() => {
    form.setFieldMeta("loadingField", (prev) => ({
      ...prev,
      errors: [],
      isValidating: true,
    }));
  }, [form]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StateCard label={t.fieldStates.default}>
        <form.AppField name="defaultField">
          {(field) => <field.TextField />}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.filled}>
        <form.AppField name="filledField">
          {(field) => <field.TextField />}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.error}>
        <form.AppField
          name="errorField"
          validators={{
            onChange: fieldStateErrorSchema,
          }}
        >
          {(field) => <field.TextField />}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.warning}>
        <form.AppField name="warningField">
          {(field) => (
            <>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border-warning"
              />
              <p className="text-warning text-xs">This value looks unusual</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <FormFieldInfo field={field as any} />
            </>
          )}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.disabled}>
        <form.AppField name="disabledField">
          {(field) => (
            <>
              <Input id={field.name} value={field.state.value} disabled />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <FormFieldInfo field={field as any} />
            </>
          )}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.loading}>
        <form.AppField name="loadingField">
          {(field) => <field.TextField />}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.readOnly}>
        <form.AppField name="readOnlyField">
          {(field) => (
            <>
              <Input id={field.name} value={field.state.value} readOnly />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <FormFieldInfo field={field as any} />
            </>
          )}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.required}>
        <form.AppField name="requiredField">
          {(field) => <field.TextField required />}
        </form.AppField>
      </StateCard>
    </div>
  );
}
