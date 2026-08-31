import type { useToast } from "@/components/ui/Toast";
import type { useApiKeyActions } from "@/api/client/api-keys/actions";
import type { Dispatch, SetStateAction } from "react";

type ToastFn = ReturnType<typeof useToast>["toast"];
type CreateApiKey = ReturnType<typeof useApiKeyActions>["createApiKey"];

export interface CreateApiKeyFormProps {
  creating: boolean;
  setCreating: Dispatch<SetStateAction<boolean>>;
  newName: string;
  setNewName: Dispatch<SetStateAction<string>>;
  newExpiry: string;
  setNewExpiry: Dispatch<SetStateAction<string>>;
  setNewKeyResult: Dispatch<SetStateAction<string | null>>;
  toast: ToastFn;
  loadKeys: () => Promise<void>;
  createApiKey: CreateApiKey;
  onCancel: () => void;
}
