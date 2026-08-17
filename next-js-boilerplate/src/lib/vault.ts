import { VAULT_TOKEN_HEADER } from "@/constants/api/headers";
import { VAULT_SECRET_PATH } from "@/constants/api/urls";
import { logger } from "@/lib/logger";

export type VaultSecrets = Record<string, string>;

function vaultConfig(): { addr: string; token: string } | null {
  const addr = (process.env.VAULT_ADDR ?? "").replace(/\/+$/, "");
  const token = process.env.VAULT_TOKEN ?? "";
  return addr && token ? { addr, token } : null;
}

export async function readVaultSecrets(
  path: string = VAULT_SECRET_PATH,
): Promise<VaultSecrets> {
  const cfg = vaultConfig();
  if (!cfg) return {};

  const url = `${cfg.addr}/v1/${path.replace(/^\/+/, "")}`;

  const res = await fetch(url, {
    headers: { [VAULT_TOKEN_HEADER]: cfg.token },
  });

  if (!res.ok) return {};

  const body = (await res.json()) as {
    data?: { data?: VaultSecrets } | VaultSecrets;
  };

  if (!body.data) return {};

  return "data" in body.data && typeof body.data.data === "object"
    ? (body.data as { data: VaultSecrets }).data
    : (body.data as VaultSecrets);
}

export async function loadVaultIntoEnv(): Promise<void> {
  const cfg = vaultConfig();
  if (!cfg) {
    logger.warn("VAULT_ADDR or VAULT_TOKEN not set — skipping vault");
    return;
  }

  try {
    const secrets = await readVaultSecrets();
    let count = 0;
    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value;
      count++;
    }
    logger.info(
      { count, path: VAULT_SECRET_PATH },
      "loaded secrets from vault",
    );
  } catch (err) {
    logger.warn({ err }, "failed to load secrets from vault");
  }
}
