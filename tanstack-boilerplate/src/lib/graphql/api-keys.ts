export const MY_API_KEYS_QUERY = `
  query MyApiKeys {
    myApiKeys {
      id  name  keyPrefix  createdAt  lastUsedAt  expiresAt  enabled  role  tier
    }
  }
`;

export const CREATE_API_KEY_MUTATION = `
  mutation CreateApiKey($name: String!, $expiresInDays: Int) {
    createApiKey(name: $name, expiresInDays: $expiresInDays) {
      fullKey
      key { id  name  keyPrefix  createdAt  expiresAt  enabled  role  tier }
    }
  }
`;

export const REVOKE_API_KEY_MUTATION = `
  mutation RevokeApiKey($id: String!) {
    revokeApiKey(id: $id)
  }
`;

export const UPDATE_API_KEY_MUTATION = `
  mutation UpdateApiKey($id: String!, $name: String, $enabled: Boolean) {
    updateApiKey(id: $id, name: $name, enabled: $enabled) {
      id  name  keyPrefix  createdAt  lastUsedAt  expiresAt  enabled  role  tier
    }
  }
`;
