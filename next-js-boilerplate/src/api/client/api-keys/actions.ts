export function useApiKeyActions() {
  const createApiKey = async (name: string, expiresInDays?: number | null) => {
    const { createApiKeyServer } = await import("@/api/server/api-keys/create");
    return createApiKeyServer(name, expiresInDays ?? null);
  };

  const revokeApiKey = async (id: string) => {
    const { revokeApiKeyServer } = await import("@/api/server/api-keys/revoke");
    await revokeApiKeyServer(id);
  };

  const updateApiKey = async (
    id: string,
    changes: { name?: string; enabled?: boolean },
  ) => {
    const { updateApiKeyServer } = await import("@/api/server/api-keys/update");
    return updateApiKeyServer(id, changes);
  };

  return { createApiKey, revokeApiKey, updateApiKey };
}
