/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { FormLevelError } from "@/components/ui/FormLevelError";
import type { ApiKeyInfo } from "@/api/server/api-keys/list";

const PERMISSION_OPTIONS = [
  { value: "read:users", label: "Read Users" },
  { value: "write:users", label: "Write Users" },
  { value: "read:posts", label: "Read Posts" },
  { value: "write:posts", label: "Write Posts" },
  { value: "read:billing", label: "Read Billing" },
  { value: "write:billing", label: "Write Billing" },
  { value: "admin", label: "Admin (all)" },
];

const EXPIRY_OPTIONS = [
  { value: "30", label: "30 Days" },
  { value: "60", label: "60 Days" },
  { value: "90", label: "90 Days" },
  { value: "never", label: "No Expiry" },
];

interface ApiKeyCreateFormProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  keys: ApiKeyInfo[] | undefined;
  t: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onSubmit: (e: React.FormEvent) => void;
}

export function ApiKeyCreateForm({
  form,
  keys,
  t,
  onSubmit,
}: ApiKeyCreateFormProps) {
  const [ipInput, setIpInput] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);

  const handleAddIp = useCallback(() => {
    const ip = ipInput.trim();
    if (!ip) return;
    if (ipWhitelist.includes(ip)) return;
    setIpWhitelist((prev) => [...prev, ip]);
    setIpInput("");
  }, [ipInput, ipWhitelist]);

  const handleRemoveIp = useCallback((ip: string) => {
    setIpWhitelist((prev) => prev.filter((v) => v !== ip));
  }, []);

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
            if (!value?.trim()) return t.apiKey.nameRequired ?? "Key name is required";
            if (value.length > 60) return t.apiKey.nameTooLong ?? "Key name must be 60 characters or fewer";
            return undefined;
          },
          onBlur: ({ value }: { value: string }) => {
            if (!value?.trim()) return undefined;
            return keys?.some((k) => k.name === value.trim()) ? (t.apiKey.nameExists ?? "You already have a key with this name") : undefined;
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
            options={EXPIRY_OPTIONS}
          />
        )}
      </form.AppField>
      <form.AppField name="permissions">
        {(field: any) => (
          <field.CheckboxField
            label={t.apiKey.permissionsLabel}
            options={PERMISSION_OPTIONS}
          />
        )}
      </form.AppField>

      <div className="flex flex-col gap-1">
        <span className="text-xxs text-muted font-medium">{t.apiKey.ipWhitelistLabel}</span>
        <div className="flex gap-2">
          <input
            className="border-border bg-field flex-1 rounded border px-2 py-1.5 text-xs"
            placeholder={t.apiKey.ipPlaceholder}
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddIp(); } }}
          />
          <Button size="sm" variant="outline" type="button" onClick={handleAddIp}>
            {t.apiKey.addIp}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ipWhitelist.map((ip) => (
            <span key={ip} className="bg-emphasis text-xxs flex items-center gap-1 rounded px-2 py-1">
              {ip}
              <button type="button" onClick={() => handleRemoveIp(ip)} className="text-destructive" aria-label={`${t.apiKey.removeIp} ${ip}`}>
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      <form.AppForm>
        <form.SubmitButton
          label={t.apiKey.create}
          loadingLabel={t.apiKey.creating}
        />
      </form.AppForm>
    </form>
  );
}
