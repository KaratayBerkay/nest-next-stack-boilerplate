import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchKeyBackupServer,
  saveKeyBackupServer,
  type EncryptedKeyBackup,
} from "@/api/server/e2ee/backup";

/**
 * Re-register the (restored) identity bundle with the server. Called after
 * importing a key backup — a fresh identity may have been generated and
 * registered during the window between the wipe and the import, so the
 * server must be brought back in line with the restored keys.
 */
export async function reestablishE2eeRegistration(
  ownUserId: string,
): Promise<void> {
  const { getDeviceId } = await import("@/lib/crypto/chat");
  const { ensureIdentity } = await import("@/lib/crypto/identity");
  const { registerBundleServer } =
    await import("@/api/server/e2ee/register-bundle");

  const { identity, bundle, serverPrekeys } = await ensureIdentity(
    ownUserId,
    getDeviceId(ownUserId),
  );
  if (identity) {
    await registerBundleServer({ bundle, oneTimePrekeys: serverPrekeys });
  }
}

/** True when a password-encrypted backup is stored on the server. */
export function useKeyBackupStatus() {
  return useQuery({
    queryKey: ["e2ee", "key-backup", "status"],
    queryFn: async () => {
      const res = await fetchKeyBackupServer();
      return !!res.backup;
    },
  });
}

/** Store a password-encrypted backup on the server. */
export function useSaveKeyBackup() {
  return useMutation({
    mutationFn: (backup: EncryptedKeyBackup) => saveKeyBackupServer(backup),
    onSuccess: (_data, backup) => {
      // No client state changes — the backup lives on the server.
      void backup;
    },
  });
}

/**
 * Fetch, decrypt, and restore the server-side key backup. Re-registers the
 * restored bundle and invalidates conversation queries so re-decryption
 * runs against the restored cache.
 */
export function useRestoreKeyBackup(ownUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      const { decryptKeyBackup, importE2eeKeys } =
        await import("@/lib/crypto/key-recovery");

      const res = await fetchKeyBackupServer();
      if (!res.backup) {
        throw new Error("No key backup stored on the server");
      }

      const backup = await decryptKeyBackup(res.backup, password);
      await importE2eeKeys(ownUserId, backup);
      await reestablishE2eeRegistration(ownUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["e2ee"] });
    },
  });
}
