import pino from 'pino';

// Runs before NestFactory.create(), so the app's DI-managed Pino logger (see
// logging/logging.config.ts) doesn't exist yet — a standalone instance is the
// only way to keep this bootstrap step's output structured JSON like the rest
// of the app, instead of falling back to plain console text.
const logger = pino({
  name: 'VaultLoader',
  level:
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
});

const VAULT_SECRET_PATH = 'secret/data/secret/production/backend';

export async function loadVaultSecrets(): Promise<void> {
  const addr = (process.env.VAULT_ADDR ?? '').replace(/\/+$/, '');
  const token = process.env.VAULT_TOKEN ?? '';

  if (!addr || !token) {
    logger.warn('VAULT_ADDR or VAULT_TOKEN not set — skipping vault');
    return;
  }

  const url = `${addr}/v1/${VAULT_SECRET_PATH}`;

  try {
    // fallow-ignore-next-line security-sink — VAULT_ADDR is infra config
    const res = await fetch(url, {
      headers: { 'X-Vault-Token': token },
    });

    if (!res.ok) {
      logger.warn(
        { status: res.status, path: VAULT_SECRET_PATH },
        'vault returned a non-OK status — skipping',
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
    logger.info(
      { count, path: VAULT_SECRET_PATH },
      'loaded secrets from vault',
    );
  } catch (err) {
    logger.warn({ err }, 'failed to load secrets from vault');
  }
}
