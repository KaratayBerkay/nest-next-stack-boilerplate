"use client";

import { useMemo } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { createFieldStateSchemas } from "@/validators/forms/field-states";
import { ROLE_OPTIONS, validationFormOpts } from "./FieldStatesHelpers";

export function EagerForm() {
  const t = useMessages("forms");
  const fieldSchemas = useMemo(
    () => createFieldStateSchemas(t.fieldStates),
    [t],
  );
  const form = useAppForm({
    ...validationFormOpts,
  });

  return (
    <form className="flex flex-col gap-3">
      <form.AppField name="name" validators={{ onChange: fieldSchemas.name }}>
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField name="email" validators={{ onChange: fieldSchemas.email }}>
        {(field) => <field.TextField label="Email" />}
      </form.AppField>
      <form.AppField name="role" validators={{ onChange: fieldSchemas.role }}>
        {(field) => (
          <field.SelectField
            label="Role"
            options={ROLE_OPTIONS}
            placeholder="Select a role..."
          />
        )}
      </form.AppField>
    </form>
  );
}

export function ClassicForm() {
  const t = useMessages("forms");
  const fieldSchemas = useMemo(
    () => createFieldStateSchemas(t.fieldStates),
    [t],
  );
  const form = useAppForm({
    ...validationFormOpts,
  });

  return (
    <form className="flex flex-col gap-3">
      <form.AppField name="name" validators={{ onBlur: fieldSchemas.name }}>
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField name="email" validators={{ onBlur: fieldSchemas.email }}>
        {(field) => <field.TextField label="Email" />}
      </form.AppField>
      <form.AppField name="role" validators={{ onBlur: fieldSchemas.role }}>
        {(field) => (
          <field.SelectField
            label="Role"
            options={ROLE_OPTIONS}
            placeholder="Select a role..."
          />
        )}
      </form.AppField>
    </form>
  );
}
