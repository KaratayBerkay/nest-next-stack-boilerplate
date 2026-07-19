const VAULT_SECRET_PATH = 'secret/data/secret/production/backend';

export async function loadVaultSecrets(): Promise<void> {
  const addr = (process.env.VAULT_ADDR ?? '').replace(/\/+$/, '');
  const token = process.env.VAULT_TOKEN ?? '';

  if (!addr || !token) {
    console.warn(
      '[VaultLoader] VAULT_ADDR or VAULT_TOKEN not set — skipping vault',
    );
    return;
  }

  const url = `${addr}/v1/${VAULT_SECRET_PATH}`;

  try {
    // fallow-ignore-next-line security-sink — VAULT_ADDR is infra config
    const res = await fetch(url, {
      headers: { 'X-Vault-Token': token },
    });

    if (!res.ok) {
      console.warn(
        `[VaultLoader] vault returned ${res.status} for ${VAULT_SECRET_PATH} — skipping`,
      );
      return;
    }

    const body = (await res.json()) as {
      data?: { data?: Record<string, string> } | Record<string, string>;
    };

    if (!body.data) return;

    const secrets =
      'data' in body.data && typeof body.data.data === 'object'
        ? (body.data as { data: Record<string, string> }).data
        : (body.data as Record<string, string>);

    let count = 0;
    for (const [key, value] of Object.entries(secrets)) {
      if (typeof value === 'string') {
        process.env[key] = value;
        count++;
      }
    }
    console.log(
      `[VaultLoader] loaded ${count} secrets from ${VAULT_SECRET_PATH}`,
    );
  } catch (err) {
    console.warn(
      `[VaultLoader] failed to load secrets: ${(err as Error).message}`,
    );
  }
}
