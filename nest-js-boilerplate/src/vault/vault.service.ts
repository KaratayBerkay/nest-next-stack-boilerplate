import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private readonly addr: string;
  private readonly token: string;

  constructor() {
    this.addr = process.env.VAULT_ADDR ?? '';
    this.token = process.env.VAULT_TOKEN ?? '';
  }

  get configured(): boolean {
    return !!(this.addr && this.token);
  }

  async readSecrets(path: string): Promise<Record<string, string>> {
    const addr = this.addr.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    const url = `${addr}/v1/${cleanPath}`;

    this.logger.debug(`Reading vault path: ${cleanPath}`);

    // fallow-ignore-next-line security-sink — VAULT_ADDR is infra config
    const res = await fetch(url, {
      headers: { 'X-Vault-Token': this.token },
    });

    if (!res.ok) {
      throw new Error(`Vault returned ${res.status} for ${cleanPath}`);
    }

    const body = (await res.json()) as {
      data?: { data?: Record<string, string> } | Record<string, string>;
    };

    if (!body.data) return {};

    // KV v2: body.data.data; KV v1: body.data
    return 'data' in body.data && typeof body.data.data === 'object'
      ? (body.data as { data: Record<string, string> }).data
      : (body.data as Record<string, string>);
  }

  async loadIntoEnv(path: string): Promise<number> {
    const secrets = await this.readSecrets(path);
    let count = 0;
    for (const [key, value] of Object.entries(secrets)) {
      if (typeof value === 'string') {
        process.env[key] = value;
        count++;
      }
    }
    this.logger.log(`Loaded ${count} secrets from vault: ${path}`);
    return count;
  }
}
