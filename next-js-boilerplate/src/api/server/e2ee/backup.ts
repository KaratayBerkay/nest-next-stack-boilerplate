import { apiFetchJson } from "@/lib/api-client";
import { E2EE_KEYS_BACKUP_URL } from "@/constants/api/urls";
import { DELETE, GET, POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface EncryptedKeyBackup {
  ciphertext: string;
  nonce: string;
  salt: string;
}

export interface KeyBackupResponse {
  backup: EncryptedKeyBackup | null;
}

export async function saveKeyBackupServer(
  backup: EncryptedKeyBackup,
): Promise<{ saved: boolean }> {
  return apiFetchJson<{ saved: boolean }>(E2EE_KEYS_BACKUP_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify(backup),
  });
}

export async function fetchKeyBackupServer(): Promise<KeyBackupResponse> {
  return apiFetchJson<KeyBackupResponse>(E2EE_KEYS_BACKUP_URL, {
    method: GET,
  });
}

export async function deleteKeyBackupServer(): Promise<{ deleted: boolean }> {
  return apiFetchJson<{ deleted: boolean }>(E2EE_KEYS_BACKUP_URL, {
    method: DELETE,
  });
}
