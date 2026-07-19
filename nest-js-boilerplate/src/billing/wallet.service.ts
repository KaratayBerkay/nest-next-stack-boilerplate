import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureWallet(userId: string) {
    const existing = await this.prisma.wallet.findUnique({
      where: { userId_currency: { userId, currency: 'USD' } },
    });
    if (existing) return existing;
    return this.prisma.wallet.create({
      data: { userId, currency: 'USD', isPrimary: true },
    });
  }
}
