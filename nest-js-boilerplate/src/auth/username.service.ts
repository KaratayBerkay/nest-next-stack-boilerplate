import { Injectable } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';

const MIN_LENGTH = 3;
const MAX_LENGTH = 30;
const MAX_ATTEMPTS = 5;

@Injectable()
export class UsernameService {
  async generate(
    email: string,
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ): Promise<string> {
    const localPart = email.split('@')[0] ?? '';
    let base = localPart
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, MAX_LENGTH);

    if (base.length < MIN_LENGTH) {
      base = base.padEnd(MIN_LENGTH, '_');
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const suffix =
        attempt === 0
          ? ''
          : '_' + Math.floor(Math.random() * 1000000).toString(36);
      const candidate = base.slice(0, MAX_LENGTH - suffix.length) + suffix;

      const existing = await tx.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      });
      if (!existing) return candidate;
    }

    const suffix =
      '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return base.slice(0, MAX_LENGTH - suffix.length) + suffix;
  }
}
