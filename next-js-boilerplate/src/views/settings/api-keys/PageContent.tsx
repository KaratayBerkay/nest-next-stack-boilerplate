"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/date-time";
import { API_KEYS_URL, API_KEYS_PREFIX } from "@/constants/api/urls";
import { POST, DELETE } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { Dispatch, SetStateAction } from "react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  enabled: boolean;
  role: string;
  tier: string;
}

interface CreateResult {
  fullKey: string;
  key: ApiKey;
}

async function handleCreateApiKey(
  newName: string,
  setCreating: Dispatch<SetStateAction<boolean>>,
  setNewKeyResult: Dispatch<SetStateAction<string | null>>,
  toast: ReturnType<typeof useToast>["toast"],
  setNewName: Dispatch<SetStateAction<string>>,
  setNewExpiry: Dispatch<SetStateAction<string>>,
  loadKeys: () => Promise<void>,
  newExpiry: string,
) {
  if (!newName.trim()) return;
  setCreating(true);
  setNewKeyResult(null);
  try {
    const result = await apiFetchJson<CreateResult>(API_KEYS_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({
        name: newName.trim(),
        expiresInDays: newExpiry ? parseInt(newExpiry, 10) : null,
      }),
    });
    setNewKeyResult(result.fullKey);
    toast({ title: "API key created" });
    setNewName("");
    setNewExpiry("");
    await loadKeys();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } }).exception;
    toast({ title: exception?.msg ?? "Failed to create API key", variant: "destructive" });
  } finally {
    setCreating(false);
  }
}

async function handleRevokeApiKey(
  id: string,
  name: string,
  toast: ReturnType<typeof useToast>["toast"],
  loadKeys: () => Promise<void>,
) {
  if (!confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
  try {
    await apiFetchJson(API_KEYS_PREFIX + id, { method: DELETE });
    toast({ title: `API key "${name}" revoked` });
    await loadKeys();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } }).exception;
    toast({ title: exception?.msg ?? "Failed to revoke API key", variant: "destructive" });
  }
}

export default function PageContent() {
  const { user } = useAuth();
  const t = useMessages("settings");
  const { toast } = useToast();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const data = await apiFetchJson<{ apiKeys: ApiKey[] }>(API_KEYS_URL);
      setKeys(data.apiKeys);
    } catch {
      toast({ title: "Failed to load API keys", variant: "destructive" });
    } finally {
      setLoadingKeys(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) loadKeys(); // eslint-disable-line react-hooks/set-state-in-effect
    else setLoadingKeys(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [user, loadKeys]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">API Keys</h2>
      <p className="text-muted text-sm">
        API keys allow programmatic access to your account. Treat them like passwords.
      </p>

      {newKeyResult && (
        <div className="surface border-brand/30 rounded-lg border p-4">
          <p className="mb-1 text-sm font-semibold text-green-600">
            Key created — copy it now. You won&apos;t see it again.
          </p>
          <code className="bg-surface-hover block w-full break-all rounded px-3 py-2 text-sm font-mono">
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
          <Button className="mt-2 ml-2" size="sm" variant="outline" onClick={() => setNewKeyResult(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {showCreate ? (
        <div className="surface flex flex-col gap-3 rounded-lg p-4">
          <h3 className="font-semibold">Create new API key</h3>
          <Input
            placeholder="Key name (e.g. 'CI/CD', 'Development')"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={creating}
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            {[
              { value: "", label: "No expiry" },
              { value: "7", label: "7 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
              { value: "365", label: "1 year" },
            ].map((opt) => (
              <Button
                key={opt.value}
                type="button"
                disabled={creating}
                variant={newExpiry === opt.value ? "primary" : "outline"}
                size="xs"
                onClick={() => setNewExpiry(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleCreateApiKey(newName, setCreating, setNewKeyResult, toast, setNewName, setNewExpiry, loadKeys, newExpiry)} disabled={creating || !newName.trim()} size="sm">
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + New API key
          </Button>
        </div>
      )}

      {loadingKeys ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : keys.length === 0 ? (
        <p className="text-muted text-sm">No API keys yet. Create one to get started.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {keys.map((key) => (
            <div key={key.id} className="surface flex items-center justify-between rounded-lg p-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{key.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      key.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {key.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <code className="text-muted text-xs font-mono">{key.keyPrefix}...</code>
                <div className="text-muted flex gap-4 text-xs">
                  <span>Created {formatDate(key.createdAt)}</span>
                  {key.lastUsedAt && <span>Last used {formatDate(key.lastUsedAt)}</span>}
                  {key.expiresAt && <span>Expires {formatDate(key.expiresAt)}</span>}
                  {!key.expiresAt && <span>No expiry</span>}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRevokeApiKey(key.id, key.name, toast, loadKeys)}
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
