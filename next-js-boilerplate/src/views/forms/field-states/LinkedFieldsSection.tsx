"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";

export function LinkedFieldsSection() {
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <div className="surface border-border flex flex-col gap-4 rounded-lg border p-4">
      <p className="text-xs font-medium">{t.fieldStates.linkedFields}</p>
      <p className="text-xxs text-muted">
        Changing the password field re-validates the confirm field. Uses{" "}
        <code>onChangeListenTo</code>.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.AppField name="password">
          {(field) => <field.TextField label={t.fieldStates.password} />}
        </form.AppField>
        <form.AppField
          name="confirmPassword"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) => {
              const pw = fieldApi.form.getFieldValue("password");
              return value === pw ? undefined : "Passwords must match";
            },
          }}
        >
          {(field) => <field.TextField label={t.fieldStates.confirmPassword} />}
        </form.AppField>
      </div>
    </div>
  );
}
