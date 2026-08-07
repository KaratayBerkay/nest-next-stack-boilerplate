import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Optional `tx`: pass the enclosing $transaction's client when calling
   * this from inside one (e.g. billing.service.ts's advisory-locked
   * transactions) so wallet creation is actually part of that transaction's
   * atomicity instead of silently committing outside it.
   */
  async ensureWallet(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const existing = await client.wallet.findUnique({
      where: { userId_currency: { userId, currency: 'USD' } },
    });
    if (existing) return existing;
    try {
      return await client.wallet.create({
        data: { userId, currency: 'USD', isPrimary: true },
      });
    } catch (err) {
      // Two concurrent first-time calls (double-submit cancel, two-tab admin
      // tier change) can both pass the findUnique check above and race on
      // the unique (userId, currency) constraint — the loser re-fetches
      // instead of surfacing an unhandled P2002.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const wallet = await client.wallet.findUnique({
          where: { userId_currency: { userId, currency: 'USD' } },
        });
        if (wallet) return wallet;
      }
      throw err;
    }
  }
}
