"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { apiKeyListQueryOptions } from "@/api/client/api-keys/query";
import { ApiKeyCreateForm } from "@/views/forms/api-key/ApiKeyCreateForm";
import { ApiKeyList } from "@/views/forms/api-key/ApiKeyList";
import { useApiKeyMutations } from "@/views/forms/api-key/useApiKeyMutations";

export default function ApiKeyPage() {
  const t = useMessages("forms");
  const { toast } = useToast();
  const { createMutation, revokeMutation, form } = useApiKeyMutations(t, {
    onCreated: (fullKey) => {
      setNewKeySecret(fullKey);
      setShowForm(false);
    },
  });
  const [showForm, setShowForm] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(
    new Set(),
  );

  const { data: keys, isLoading } = useQuery(apiKeyListQueryOptions());

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

  const handleReveal = useCallback((id: string) => {
    setRevealedSecrets((prev) => new Set(prev).add(id));
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
        <ApiKeyCreateForm
          form={form}
          keys={keys}
          t={t}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        />
      )}

      <Separator />

      <ApiKeyList
        keys={keys ?? []}
        t={t}
        revealedSecrets={revealedSecrets}
        onReveal={handleReveal}
        onCopy={handleCopy}
        onRevoke={handleRevoke}
      />
    </div>
  );
}
