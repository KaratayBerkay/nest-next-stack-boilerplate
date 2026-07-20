"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { useAppForm } from "@/features/forms/form-hook";
import { formOptions } from "@tanstack/react-form";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Separator } from "@/components/ui/Separator";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { exceptionHandler, getSurface } from "@/lib/exception-handler";
import { useApiKeyActions } from "@/api/client/api-keys/actions";
import { apiKeyListQueryOptions } from "@/api/client/api-keys/query";
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

export default function ApiKeyPage() {
  const t = useMessages("forms");
  const messages = useAllMessages();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createApiKey, revokeApiKey } = useApiKeyActions();
  const [showForm, setShowForm] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(
    new Set(),
  );
  const [ipInput, setIpInput] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);

  const { data: keys, isLoading } = useQuery(apiKeyListQueryOptions());

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      expiresIn: string;
      permissions: string[];
    }) => {
      const expiresInDays =
        data.expiresIn === "never" ? null : Number(data.expiresIn);
      return createApiKey(data.name, expiresInDays);
    },
    onSuccess: (result) => {
      setNewKeySecret(result.fullKey);
      setShowForm(false);
      setIpWhitelist([]);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["api-keys", "list"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await revokeApiKey(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["api-keys", "list"] });
      const previous = queryClient.getQueryData<ApiKeyInfo[]>([
        "api-keys",
        "list",
      ]);
      queryClient.setQueryData<ApiKeyInfo[]>(["api-keys", "list"], (old) =>
        old?.filter((k) => k.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous)
        queryClient.setQueryData(["api-keys", "list"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", "list"] });
    },
  });

  const form = useAppForm({
    ...formOptions({
      defaultValues: {
        name: "",
        expiresIn: "30",
        permissions: [] as string[],
      },
      validators: {
        onSubmitAsync: async ({ value }) => {
          try {
            await createMutation.mutateAsync(value);
            return null;
          } catch (err) {
            const exc = (
              err as { exception?: { exc: string; key: string; msg: string } }
            ).exception;
            if (!exc) return { form: t.errors.unknown, fields: {} };
            const surface = getSurface(exc.exc);
            if (surface === "toast") {
              toast({
                description: exceptionHandler(exc, messages),
                variant: "destructive",
              });
              return null;
            }
            return { form: exceptionHandler(exc, messages), fields: {} };
          }
        },
      },
    }),
  });

  const handleCopy = useCallback(
    async (secret: string) => {
      await navigator.clipboard.writeText(secret);
      toast({ description: t.apiKey.copied, variant: "default" });
    },
    [toast, t],
  );

  const handleRevoke = useCallback(
    (id: string) => {
      revokeMutation.mutate(id);
      toast({ description: t.apiKey.revoked, variant: "default" });
    },
    [revokeMutation, toast, t],
  );

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

  if (isLoading) {
    return (
      <div className="text-muted flex items-center justify-center py-12 text-sm">
        {t.fieldStates.loading}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{t.apiKey.heading}</h2>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm((p) => !p);
          }}
        >
          {showForm ? t.apiKey.cancel : t.apiKey.newKey}
        </Button>
      </div>

      {newKeySecret && (
        <div className="surface border-border rounded-lg border p-4">
          <p className="text-xxs font-semibold">{t.apiKey.revealSecret}</p>
          <code className="bg-emphasis mt-1 block rounded p-2 text-xs break-all">
            {newKeySecret}
          </code>
          <p className="text-xxs text-destructive mt-1">
            {t.apiKey.secretNote}
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(newKeySecret)}
            >
              {t.apiKey.copy}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNewKeySecret(null)}
            >
              {t.apiKey.dismiss}
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="surface border-border flex flex-col gap-3 rounded-lg border p-4"
        >
          <FormLevelError form={form} />
          <form.AppField
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!value?.trim()) return t.apiKey.nameRequired ?? "Key name is required";
                if (value.length > 60) return t.apiKey.nameTooLong ?? "Key name must be 60 characters or fewer";
                return undefined;
              },
              onBlur: ({ value }) => {
                if (!value?.trim()) return undefined;
                return keys?.some((k) => k.name === value.trim())
                  ? t.apiKey.nameExists ?? "You already have a key with this name"
                  : undefined;
              },
            }}
          >
            {(field) => (
              <field.TextField
                label={t.apiKey.nameLabel}
                placeholder={t.apiKey.namePlaceholder}
              />
            )}
          </form.AppField>
          <form.AppField name="expiresIn">
            {(field) => (
              <field.SelectField
                label={t.apiKey.expiresLabel}
                options={EXPIRY_OPTIONS}
              />
            )}
          </form.AppField>
          <form.AppField name="permissions">
            {(field) => (
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
              <input
                className="border-border bg-field flex-1 rounded border px-2 py-1.5 text-xs"
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
                <span
                  key={ip}
                  className="bg-emphasis text-xxs flex items-center gap-1 rounded px-2 py-1"
                >
                  {ip}
                  <button
                    type="button"
                    onClick={() => handleRemoveIp(ip)}
                    className="text-destructive"
                    aria-label={`${t.apiKey.removeIp} ${ip}`}
                  >
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
      )}

      <Separator />

      {keys?.length === 0 ? (
        <p className="text-muted py-8 text-center text-xs">{t.apiKey.empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {keys?.map((key) => (
            <div
              key={key.id}
              className="surface border-border flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{key.name}</span>
                <div className="flex gap-1.5">
                  {!revealedSecrets.has(key.id) ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setRevealedSecrets((prev) => new Set(prev).add(key.id))
                      }
                    >
                      {t.apiKey.reveal}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(key.keyPrefix)}
                    >
                      {t.apiKey.copy}
                    </Button>
                  )}
                  <ConfirmDialog
                    title={t.apiKey.revokeConfirm}
                    description=""
                    confirmLabel={t.apiKey.revoke}
                    onConfirm={() => handleRevoke(key.id)}
                  >
                    {(open) => (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={open}
                      >
                        {t.apiKey.revoke}
                      </Button>
                    )}
                  </ConfirmDialog>
                </div>
              </div>
              <div className="text-xxs text-muted flex items-center gap-3">
                <span>Created {key.createdAt}</span>
                {key.expiresAt && <span>Expires {key.expiresAt}</span>}
                {key.lastUsedAt && <span>Last used {key.lastUsedAt}</span>}
              </div>
              {revealedSecrets.has(key.id) && (
                <code className="bg-emphasis text-xxs block rounded p-2 break-all">
                  {key.keyPrefix}_****
                </code>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
