import type { ApiKeyInfo } from "@/api/server/api-keys/list";
import type { useToast } from "@/components/ui/Toast";
import type { useApiKeyActions } from "@/api/client/api-keys/actions";

type ApiKey = ApiKeyInfo;
type ToastFn = ReturnType<typeof useToast>["toast"];
type RevokeApiKey = ReturnType<typeof useApiKeyActions>["revokeApiKey"];

export interface ApiKeyListProps {
  keys: ApiKey[];
  loadingKeys: boolean;
  toast: ToastFn;
  loadKeys: () => Promise<void>;
  revokeApiKey: RevokeApiKey;
}
