"use client";

import { useMemo } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { revalidateLogic } from "@tanstack/react-form";
import { createFieldStateSchemas } from "@/validators/forms/field-states";
import { getRoleOptions, validationFormOpts } from "./FieldStatesHelpers";

export function DynamicForm() {
  const t = useMessages("forms");
  const fieldSchemas = useMemo(
    () => createFieldStateSchemas(t.fieldStates),
    [t],
  );
  const roleOptions = useMemo(() => getRoleOptions(t.fieldStates), [t]);
  const form = useAppForm({
    ...validationFormOpts,
    validationLogic: revalidateLogic({ mode: "blur" }),
  });

  return (
    <form className="flex flex-col gap-3">
      <form.AppField name="name" validators={{ onDynamic: fieldSchemas.name }}>
        {(field) => <field.TextField label={t.fieldStates.nameLabel} />}
      </form.AppField>
      <form.AppField
        name="email"
        validators={{ onDynamic: fieldSchemas.email }}
      >
        {(field) => <field.TextField label={t.fieldStates.emailLabel} />}
      </form.AppField>
      <form.AppField name="role" validators={{ onDynamic: fieldSchemas.role }}>
        {(field) => (
          <field.SelectField
            label={t.fieldStates.roleLabel}
            options={roleOptions}
            placeholder={t.fieldStates.rolePlaceholder}
          />
        )}
      </form.AppField>
    </form>
  );
}

export function AsyncCheckedForm() {
  const t = useMessages("forms");
  const roleOptions = useMemo(() => getRoleOptions(t.fieldStates), [t]);
  const form = useAppForm({
    ...validationFormOpts,
  });

  return (
    <form className="flex flex-col gap-3">
      <form.AppField
        name="name"
        validators={{
          onBlurAsyncDebounceMs: 300,
          onBlurAsync: async ({ value }) => {
            const { checkReservedWord } = await import("./FieldStatesHelpers");
            return checkReservedWord(value, t.fieldStates.reservedWordSuffix);
          },
        }}
      >
        {(field) => <field.TextField label={t.fieldStates.nameLabel} />}
      </form.AppField>
      <form.AppField name="email">
        {(field) => <field.TextField label={t.fieldStates.emailLabel} />}
      </form.AppField>
      <form.AppField name="role">
        {(field) => (
          <field.SelectField
            label={t.fieldStates.roleLabel}
            options={roleOptions}
            placeholder={t.fieldStates.rolePlaceholder}
          />
        )}
      </form.AppField>
    </form>
  );
}
