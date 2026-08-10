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

const IPV4_RE =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

function getPermissionOptions(t: Record<string, string>) {
  return [
    { value: "read:users", label: t.permissionReadUsers },
    { value: "write:users", label: t.permissionWriteUsers },
    { value: "read:posts", label: t.permissionReadPosts },
    { value: "write:posts", label: t.permissionWritePosts },
    { value: "read:billing", label: t.permissionReadBilling },
    { value: "write:billing", label: t.permissionWriteBilling },
    { value: "admin", label: t.permissionAdmin },
  ];
}

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
  const [ipInput, setIpInput] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [ipError, setIpError] = useState<string | null>(null);

  const handleAddIp = useCallback(() => {
    const ip = ipInput.trim();
    if (!ip) return;
    if (!IPV4_RE.test(ip)) {
      setIpError(t.apiKey.ipInvalid);
      return;
    }
    setIpError(null);
    if (ipWhitelist.includes(ip)) return;
    setIpWhitelist((prev) => [...prev, ip]);
    setIpInput("");
  }, [ipInput, ipWhitelist, t]);

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
            options={getExpiryOptions(t.apiKey)}
          />
        )}
      </form.AppField>
      <form.AppField name="permissions">
        {(field: any) => (
          <field.CheckboxField
            label={t.apiKey.permissionsLabel}
            options={getPermissionOptions(t.apiKey)}
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
            onChange={(e) => {
              setIpInput(e.target.value);
              if (ipError) setIpError(null);
            }}
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
        {ipError && <span className="text-xxs text-error">{ipError}</span>}
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
