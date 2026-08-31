/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormLevelError } from "@/components/ui/FormLevelError";
import type { ApiKeyCreateFormProps } from "@/types/views/forms/ApiKeyCreateForm-types";

function getExpiryOptions(t: Record<string, string>) {
  return [
    { value: "30", label: t.expires30 },
    { value: "60", label: t.expires60 },
    { value: "90", label: t.expires90 },
    { value: "never", label: t.expiresNever },
  ];
}

export function ApiKeyCreateForm({
  form,
  keys,
  t,
  onSubmit,
}: ApiKeyCreateFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="surface border-border flex flex-col gap-3 rounded-lg border p-4"
    >
      <FormLevelError form={form} />
      <form.AppField
        name="name"
        validators={{
          onChange: ({ value }: { value: string }) => {
            if (!value?.trim())
              return t.apiKey.nameRequired ?? "Key name is required";
            if (value.length > 60)
              return (
                t.apiKey.nameTooLong ??
                "Key name must be 60 characters or fewer"
              );
            return undefined;
          },
          onBlur: ({ value }: { value: string }) => {
            if (!value?.trim()) return undefined;
            return keys?.some((k) => k.name === value.trim())
              ? (t.apiKey.nameExists ?? "You already have a key with this name")
              : undefined;
          },
        }}
      >
        {(field: any) => (
          <field.TextField
            label={t.apiKey.nameLabel}
            placeholder={t.apiKey.namePlaceholder}
            required
          />
        )}
      </form.AppField>
      <form.AppField name="expiresIn">
        {(field: any) => (
          <field.SelectField
            label={t.apiKey.expiresLabel}
            options={getExpiryOptions(t.apiKey)}
          />
        )}
      </form.AppField>
      {/* No permissions/IP-whitelist inputs: the backend's key-creation
          mutation only accepts name/expiresInDays and never enforces scopes
          or source IPs, so collecting them here would silently promise a
          restriction the key doesn't actually have. */}

      <form.AppForm>
        <form.SubmitButton
          label={t.apiKey.create}
          loadingLabel={t.apiKey.creating}
        />
      </form.AppForm>
    </form>
  );
}
