export function useApiKeyActions() {
  const createApiKey = async (name: string, expiresInDays?: number | null) => {
    const { createApiKeyServer } = await import("@/api/server/api-keys/create");
    return createApiKeyServer(name, expiresInDays ?? null);
  };

  const revokeApiKey = async (id: string) => {
    const { revokeApiKeyServer } = await import("@/api/server/api-keys/revoke");
    await revokeApiKeyServer(id);
  };

  return { createApiKey, revokeApiKey };
}
