import type { ApiKeyInfo } from "@/api/server/api-keys/list";

export interface ApiKeyCreateFormProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  keys: ApiKeyInfo[] | undefined;
  t: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onSubmit: (e: React.FormEvent) => void;
}
