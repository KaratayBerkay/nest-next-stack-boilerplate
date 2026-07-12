export const JSON_CONTENT_TYPE_HEADER = { "Content-Type": "application/json" } as const;

export const CSRF_TOKEN_HEADER = "x-csrf-token" as const;
export const RBAC_TOKEN_HEADER = "x-rbac-token" as const;
export const DEVICE_TOKEN_HEADER = "x-device-token" as const;
export const USER_TOKEN_HEADER = "x-user-token" as const;
export const X_FORWARDED_FOR_HEADER = "x-forwarded-for" as const;
export const VAULT_TOKEN_HEADER = "X-Vault-Token" as const;

export function bearerAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
