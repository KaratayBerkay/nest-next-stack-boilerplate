import type { Dispatch, SetStateAction } from "react";
import type { useToast } from "@/components/ui/Toast";
import type { useApiKeyActions } from "@/api/client/api-keys/actions";
import type { ApiKeyInfo } from "@/api/server/api-keys/list";

type ApiKey = ApiKeyInfo;
type ToastFn = ReturnType<typeof useToast>["toast"];
type CreateApiKey = ReturnType<typeof useApiKeyActions>["createApiKey"];
type RevokeApiKey = ReturnType<typeof useApiKeyActions>["revokeApiKey"];
type UpdateApiKey = ReturnType<typeof useApiKeyActions>["updateApiKey"];

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
  createdMessage: string,
  createFailedMessage: string,
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
    toast({ title: createdMessage });
    setNewName("");
    setNewExpiry("");
    await loadKeys();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({
      title: exception?.msg ?? createFailedMessage,
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
  loadFailedMessage: string,
) {
  try {
    const { listApiKeysServer } = await import("@/api/server/api-keys/list");
    const data = await listApiKeysServer();
    setKeys(data);
  } catch {
    toast({ title: loadFailedMessage, variant: "destructive" });
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
  revokeConfirmMessage: string,
  revokedMessage: string,
  revokeFailedMessage: string,
) {
  if (!confirm(revokeConfirmMessage)) return;
  try {
    await revokeApiKey(id);
    toast({ title: revokedMessage });
    await loadKeys();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({
      title: exception?.msg ?? revokeFailedMessage,
      variant: "destructive",
    });
  }
}

export async function handleToggleApiKey(
  id: string,
  enabled: boolean,
  toast: ToastFn,
  loadKeys: () => Promise<void>,
  updateApiKey: UpdateApiKey,
  enabledMessage: string,
  updateFailedMessage: string,
) {
  try {
    await updateApiKey(id, { enabled: !enabled });
    toast({ title: enabledMessage });
    await loadKeys();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({
      title: exception?.msg ?? updateFailedMessage,
      variant: "destructive",
    });
  }
}

export async function handleRenameApiKey(
  id: string,
  currentName: string,
  toast: ToastFn,
  loadKeys: () => Promise<void>,
  updateApiKey: UpdateApiKey,
  renamePromptMessage: string,
  renamedMessage: string,
  updateFailedMessage: string,
) {
  const nextName = prompt(renamePromptMessage, currentName);
  if (!nextName || !nextName.trim() || nextName.trim() === currentName) return;
  try {
    await updateApiKey(id, { name: nextName.trim() });
    toast({ title: renamedMessage });
    await loadKeys();
  } catch (err) {
    const exception = (err as Error & { exception?: { msg?: string } })
      .exception;
    toast({
      title: exception?.msg ?? updateFailedMessage,
      variant: "destructive",
    });
  }
}
