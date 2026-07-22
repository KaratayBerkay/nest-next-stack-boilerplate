"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsApiKeysPageInfo } from "@/constants/page-info";
import { useApiKeyActions } from "@/api/client/api-keys/actions";
import type { ApiKeyInfo } from "@/api/server/api-keys/list";
import { cn } from "@/lib/cn";
import type { ClassNameProps } from "@/types/ui/ClassName-types";
import { loadApiKeys } from "./api-key-handlers";
import { CreateApiKeyForm } from "./CreateApiKeyForm";
import { ApiKeyList } from "./ApiKeyList";

type ApiKey = ApiKeyInfo;

export default function PageContent({ className }: ClassNameProps) {
  const { user } = useAuth();
  const _t = useMessages("settings");
  const { toast } = useToast();
  const { createApiKey, revokeApiKey } = useApiKeyActions();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<string | null>(null);

  const loadKeys = useCallback(
    () => loadApiKeys(setKeys, toast, setLoadingKeys),
    [toast],
  );

  useEffect(() => {
    if (user) loadKeys();
    else setLoadingKeys(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [user, loadKeys]);

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title="API Keys"
        description="API keys allow programmatic access to your account. Treat them like passwords."
        actions={<PageInfoButton content={settingsApiKeysPageInfo} />}
      />

      {newKeyResult && (
        <div className="surface border-brand/30 rounded-lg border p-4">
          <p className="mb-1 text-sm font-semibold text-green-600">
            Key created — copy it now. You won&apos;t see it again.
          </p>
          <code className="bg-surface-hover block w-full rounded px-3 py-2 font-mono text-sm break-all">
            {newKeyResult}
          </code>
          <Button
            className="mt-2"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(newKeyResult);
              toast({ title: "Copied to clipboard" });
            }}
          >
            Copy
          </Button>
          <Button
            className="mt-2 ml-2"
            size="sm"
            variant="outline"
            onClick={() => setNewKeyResult(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {showCreate ? (
        <CreateApiKeyForm
          creating={creating}
          setCreating={setCreating}
          newName={newName}
          setNewName={setNewName}
          newExpiry={newExpiry}
          setNewExpiry={setNewExpiry}
          setNewKeyResult={setNewKeyResult}
          toast={toast}
          loadKeys={loadKeys}
          createApiKey={createApiKey}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + New API key
          </Button>
        </div>
      )}

      <ApiKeyList
        keys={keys}
        loadingKeys={loadingKeys}
        toast={toast}
        loadKeys={loadKeys}
        revokeApiKey={revokeApiKey}
      />
    </div>
  );
}
