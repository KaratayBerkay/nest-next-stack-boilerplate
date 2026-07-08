export type VaultSecrets = Record<string, string>;

const VAULT_SECRET_PATH = 'production/data/frontend';

function vaultConfig(): { addr: string; token: string } | null {
  const addr = (process.env.VAULT_ADDR ?? '').replace(/\/+$/, '');
  const token = process.env.VAULT_TOKEN ?? '';
  return addr && token ? { addr, token } : null;
}

export async function readVaultSecrets(
  path: string = VAULT_SECRET_PATH,
): Promise<VaultSecrets> {
  const cfg = vaultConfig();
  if (!cfg) return {};

  const url = `${cfg.addr}/v1/${path.replace(/^\/+/, '')}`;

  const res = await fetch(url, {
    headers: { 'X-Vault-Token': cfg.token },
  });

  if (!res.ok) return {};

  const body = (await res.json()) as {
    data?: { data?: VaultSecrets } | VaultSecrets;
  };

  if (!body.data) return {};

  return 'data' in body.data && typeof body.data.data === 'object'
    ? (body.data as { data: VaultSecrets }).data
    : (body.data as VaultSecrets);
}

export async function loadVaultIntoEnv(): Promise<void> {
  const cfg = vaultConfig();
  if (!cfg) {
    console.warn('[Vault] VAULT_ADDR or VAULT_TOKEN not set — skipping');
    return;
  }

  try {
    const secrets = await readVaultSecrets();
    let count = 0;
    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value;
      count++;
    }
    console.log(`[Vault] loaded ${count} secrets from ${VAULT_SECRET_PATH}`);
  } catch (err) {
    console.warn(`[Vault] failed to load secrets: ${(err as Error).message}`);
  }
}
