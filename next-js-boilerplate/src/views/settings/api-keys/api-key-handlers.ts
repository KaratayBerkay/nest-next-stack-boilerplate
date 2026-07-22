import type { Dispatch, SetStateAction } from "react";
import type { useToast } from "@/components/ui/Toast";
import type { useApiKeyActions } from "@/api/client/api-keys/actions";
import type { ApiKeyInfo } from "@/api/server/api-keys/list";

type ApiKey = ApiKeyInfo;
type ToastFn = ReturnType<typeof useToast>["toast"];
type CreateApiKey = ReturnType<typeof useApiKeyActions>["createApiKey"];
type RevokeApiKey = ReturnType<typeof useApiKeyActions>["revokeApiKey"];

export async function handleCreateApiKey(
  newName: string,
  setCreating: Dispatch<SetStateAction<boolean>>,
  setNewKeyResult: Dispatch<SetStateAction<string | null>>,
  toast: ToastFn,
  setNewName: Dispatch<SetStateAction<string>>,
  setNewExpiry: Dispatch<SetStateAction<string>>,
  loadKeys: () => Promise<void>,
  newExpiry: string,
  createApiKey: CreateApiKey,
) {
  if (!newName.trim()) return;
  setCreating(true);
  setNewKeyResult(null);
  try {
    const result = await createApiKey(
      newName.trim(),
      newExpiry ? parseInt(newExpiry, 10) : null,
    );
    setNewKeyResult(result.fullKey);
    toast({ title: "API key created" });
    setNewName("");
    setNewExpiry("");
    await loadKeys();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({
      title: exception?.msg ?? "Failed to create API key",
      variant: "destructive",
    });
  } finally {
    setCreating(false);
  }
}

export async function loadApiKeys(
  setKeys: Dispatch<SetStateAction<ApiKey[]>>,
  toast: ToastFn,
  setLoadingKeys: Dispatch<SetStateAction<boolean>>,
) {
  try {
    const { listApiKeysServer } = await import("@/api/server/api-keys/list");
    const data = await listApiKeysServer();
    setKeys(data);
  } catch {
    toast({ title: "Failed to load API keys", variant: "destructive" });
  } finally {
    setLoadingKeys(false);
  }
}

export async function handleRevokeApiKey(
  id: string,
  name: string,
  toast: ToastFn,
  loadKeys: () => Promise<void>,
  revokeApiKey: RevokeApiKey,
) {
  if (!confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
  try {
    await revokeApiKey(id);
    toast({ title: `API key "${name}" revoked` });
    await loadKeys();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({
      title: exception?.msg ?? "Failed to revoke API key",
      variant: "destructive",
    });
  }
}
