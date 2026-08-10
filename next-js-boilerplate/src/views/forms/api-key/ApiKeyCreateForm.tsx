/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconButton } from "@/components/ui/button/icon-button";
import { Badge } from "@/components/ui/Badge";
import { FormLevelError } from "@/components/ui/FormLevelError";
import type { ApiKeyCreateFormProps } from "@/types/views/forms/ApiKeyCreateForm-types";

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
        <span className="text-xxs text-muted font-medium">
          {t.apiKey.ipWhitelistLabel}
        </span>
        <div className="flex gap-2">
          <Input
            className="flex-1 text-xs"
            placeholder={t.apiKey.ipPlaceholder}
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddIp();
              }
            }}
          />
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleAddIp}
          >
            {t.apiKey.addIp}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ipWhitelist.map((ip) => (
            <Badge key={ip} variant="secondary" className="gap-1">
              {ip}
              <IconButton
                icon={<IconX size={12} />}
                variant="ghost"
                size="icon-xs"
                className="text-error"
                onClick={() => handleRemoveIp(ip)}
                label={`${t.apiKey.removeIp} ${ip}`}
              />
            </Badge>
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
