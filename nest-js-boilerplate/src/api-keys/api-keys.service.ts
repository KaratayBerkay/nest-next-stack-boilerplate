import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const KEY_PREFIX = 'bp_';
const KEY_BYTES = 32; // 64 hex chars
const PREFIX_CHARS = 8;

export interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  enabled: boolean;
  role: string;
  tier: string;
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(
    userId: string,
    name: string,
    options?: { role?: string; tier?: string; expiresInDays?: number },
  ): Promise<{ fullKey: string; key: ApiKeyData }> {
    const raw = randomBytes(KEY_BYTES).toString('hex');
    const fullKey = `${KEY_PREFIX}${raw}`;
    const keyPrefix = fullKey.slice(0, PREFIX_CHARS);
    const keyHash = await hash(fullKey);

    const existing = await this.prisma.apiKey.findFirst({
      where: { userId, name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException({
        exc: 'EX_API_KEY_NAME_EXISTS',
        msg: `An API key named "${name}" already exists`,
        key: 'apiKeys.errors.nameExists',
      });
    }

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name,
        keyPrefix,
        keyHash,
        userId,
        role: (options?.role as never) ?? undefined,
        tier: (options?.tier as never) ?? undefined,
        expiresAt: options?.expiresInDays
          ? new Date(Date.now() + options.expiresInDays * 86400000)
          : undefined,
      },
    });

    this.logger.log(`API key created: ${keyPrefix} for user ${userId}`);

    return {
      fullKey,
      key: this.toData(apiKey),
    };
  }

  async validate(key: string): Promise<{
    userId: string;
    role: string;
    tier: string;
  } | null> {
    if (!key.startsWith(KEY_PREFIX)) return null;

    const prefix = key.slice(0, PREFIX_CHARS);
    const candidates = await this.prisma.apiKey.findMany({
      where: {
        keyPrefix: prefix,
        enabled: true,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    for (const candidate of candidates) {
      const valid = await verify(candidate.keyHash, key);
      if (valid) {
        await this.prisma.apiKey.update({
          where: { id: candidate.id },
          data: { lastUsedAt: new Date() },
        });
        return {
          userId: candidate.userId,
          role: candidate.role,
          tier: candidate.tier,
        };
      }
    }

    return null;
  }

  async listForUser(userId: string): Promise<ApiKeyData[]> {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return keys.map((k) => this.toData(k));
  }

  async revoke(id: string, userId: string): Promise<void> {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key || key.userId !== userId) {
      throw new NotFoundException({
        exc: 'EX_API_KEY_NOT_FOUND',
        msg: 'API key not found',
        key: 'apiKeys.errors.notFound',
      });
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { enabled: false, deletedAt: new Date() },
    });

    this.logger.log(`API key revoked: ${key.keyPrefix} for user ${userId}`);
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; enabled?: boolean },
  ): Promise<ApiKeyData> {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key || key.userId !== userId) {
      throw new NotFoundException({
        exc: 'EX_API_KEY_NOT_FOUND',
        msg: 'API key not found',
        key: 'apiKeys.errors.notFound',
      });
    }

    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      },
    });

    return this.toData(updated);
  }

  private toData(k: {
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
    enabled: boolean;
    role: string;
    tier: string;
  }): ApiKeyData {
    return {
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      enabled: k.enabled,
      role: k.role,
      tier: k.tier,
    };
  }
}
