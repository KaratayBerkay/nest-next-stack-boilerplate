import type { ApiKeyInfo } from "@/api/server/api-keys/list";

export interface ApiKeyListProps {
  keys: ApiKeyInfo[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  revealedSecrets: Set<string>;
  onReveal: (id: string) => void;
  onCopy: (secret: string) => void;
  onRevoke: (id: string) => void;
}
