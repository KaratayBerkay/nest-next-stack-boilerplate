import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../common/crypto/crypto.service';

@Injectable()
export class TokenDerivationService {
  private readonly secret: string;

  constructor(
    private readonly crypto: CryptoService,
    private readonly config: ConfigService,
  ) {
    this.secret = this.config.getOrThrow<string>('TOKEN_DERIVATION_SECRET');
  }

  dateOnly(d: Date = new Date()): string {
    return d.toISOString().slice(0, 10);
  }

  deriveUserToken(userId: string, date?: Date): string {
    const d = this.dateOnly(date);
    return this.crypto.hmacSha256(this.secret, `user.v1:${d}:${userId}`);
  }

  deriveRbacToken(userId: string, tier: string, date?: Date): string {
    const d = this.dateOnly(date);
    return this.crypto.hmacSha256(
      this.secret,
      `rbac.v1:${d}:${userId}:${tier}`,
    );
  }

  timingSafeEqual(a: string, b: string): boolean {
    return this.crypto.timingSafeEqual(a, b);
  }
}
