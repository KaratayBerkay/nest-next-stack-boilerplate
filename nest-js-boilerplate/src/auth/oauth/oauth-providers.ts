export interface OAuthProviderConfig {
  name: string;
  label: string;
  authUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  pkce?: boolean;
  useBasicAuth?: boolean;
  additionalHeaders?: Record<string, string>;
  transformProfile: (
    raw: Record<string, unknown>,
    accessToken: string,
    clientId: string,
  ) => Promise<OAuthProfileResult>;
  fetchEmail?: (
    accessToken: string,
    clientId?: string,
  ) => Promise<string | null>;
}

export interface OAuthProfileResult {
  type: string;
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string | null;
}

export const oauthProviders: Record<string, OAuthProviderConfig> = {
  google: {
    name: 'google',
    label: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    // v3 userinfo is OIDC-compliant and returns the stable id as `sub`;
    // the legacy v2 endpoint returns it as `id` (accepted as fallback below).
    userinfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopes: ['openid', 'email', 'profile'],
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    transformProfile: (raw) =>
      Promise.resolve({
        type: 'GOOGLE',
        provider: 'google',
        providerAccountId: String(
          (raw.sub as string | null | undefined) ??
            (raw.id as string | null | undefined) ??
            '',
        ),
        email: String((raw.email as string | null | undefined) ?? ''),
        name: String((raw.name as string | null | undefined) ?? '') || null,
      }),
  },

  github: {
    name: 'github',
    label: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userinfoUrl: 'https://api.github.com/user',
    scopes: ['read:user', 'user:email'],
    clientIdEnv: 'GITHUB_CLIENT_ID',
    clientSecretEnv: 'GITHUB_CLIENT_SECRET',
    transformProfile: (raw) =>
      Promise.resolve({
        type: 'GITHUB',
        provider: 'github',
        providerAccountId: String((raw.id as string | null | undefined) ?? ''),
        email: String((raw.email as string | null | undefined) ?? ''),
        name: String((raw.name as string | null | undefined) ?? '') || null,
      }),
    fetchEmail: async (accessToken) => {
      const res = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      });
      if (!res.ok) return null;
      const emails = (await res.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      return emails.find((e) => e.primary && e.verified)?.email ?? null;
    },
  },

  x: {
    name: 'x',
    label: 'X',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userinfoUrl: 'https://api.twitter.com/2/users/me',
    scopes: ['tweet.read', 'users.read'],
    clientIdEnv: 'X_CLIENT_ID',
    clientSecretEnv: 'X_CLIENT_SECRET',
    pkce: true,
    useBasicAuth: true,
    transformProfile: (raw) => {
      const data = (raw.data ?? {}) as Record<string, unknown>;
      return Promise.resolve({
        type: 'TWITTER',
        provider: 'x',
        providerAccountId: String((data.id as string | null | undefined) ?? ''),
        email: String((raw.email as string | null | undefined) ?? ''),
        name:
          String((data.name as string | null | undefined) ?? '') ||
          String((data.username as string | null | undefined) ?? '') ||
          null,
      });
    },
    fetchEmail: async (accessToken) => {
      const res = await fetch(
        'https://api.twitter.com/2/users/me?user.fields=email',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as {
        data?: { email?: string };
      };
      return body?.data?.email ?? null;
    },
  },

  linkedin: {
    name: 'linkedin',
    label: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userinfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scopes: ['openid', 'profile', 'email'],
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
    clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    transformProfile: (raw) =>
      Promise.resolve({
        type: 'LINKEDIN',
        provider: 'linkedin',
        providerAccountId: String((raw.sub as string | null | undefined) ?? ''),
        email: String((raw.email as string | null | undefined) ?? ''),
        name: String((raw.name as string | null | undefined) ?? '') || null,
      }),
  },

  huggingface: {
    name: 'huggingface',
    label: 'Hugging Face',
    authUrl: 'https://huggingface.co/oauth/authorize',
    tokenUrl: 'https://huggingface.co/oauth/token',
    userinfoUrl: 'https://huggingface.co/oauth/userinfo',
    scopes: ['openid', 'profile'],
    clientIdEnv: 'HUGGING_FACE_CLIENT_ID',
    clientSecretEnv: 'HUGGING_FACE_CLIENT_SECRET',
    transformProfile: (raw) =>
      Promise.resolve({
        type: 'HUGGING_FACE',
        provider: 'huggingface',
        providerAccountId: String((raw.sub as string | null | undefined) ?? ''),
        email: String((raw.email as string | null | undefined) ?? ''),
        name:
          String((raw.name as string | null | undefined) ?? '') ||
          String((raw.preferred_username as string | null | undefined) ?? '') ||
          null,
      }),
  },

  twitch: {
    name: 'twitch',
    label: 'Twitch',
    authUrl: 'https://id.twitch.tv/oauth2/authorize',
    tokenUrl: 'https://id.twitch.tv/oauth2/token',
    userinfoUrl: 'https://api.twitch.tv/helix/users',
    scopes: ['openid', 'user:read:email'],
    clientIdEnv: 'TWITCH_CLIENT_ID',
    clientSecretEnv: 'TWITCH_CLIENT_SECRET',
    additionalHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
    transformProfile: (raw, _accessToken, _clientId) => {
      // Twitch userinfo returns { data: [{ id, login, display_name, email }] }
      const arr = (raw.data ?? []) as Array<Record<string, unknown>>;
      const user = arr[0] ?? {};
      return Promise.resolve({
        type: 'TWITCH',
        provider: 'twitch',
        providerAccountId: String((user.id as string | null | undefined) ?? ''),
        email: String((user.email as string | null | undefined) ?? ''),
        name:
          String((user.display_name as string | null | undefined) ?? '') ||
          String((user.login as string | null | undefined) ?? '') ||
          null,
      });
    },
  },
};
