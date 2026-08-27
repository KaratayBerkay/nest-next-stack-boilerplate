import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import type { User } from '../../@generated/user/user.model';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class DataloaderService {
  private userLoader: DataLoader<string, User | null> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  getUserLoader(): DataLoader<string, User | null> {
    if (!this.userLoader) {
      this.userLoader = new DataLoader<string, User | null>(async (ids) => {
        const users = await this.prisma.user.findMany({
          where: { id: { in: [...ids] } },
        });
        const map = new Map(users.map((u) => [u.id, u]));
        return ids.map((id) => map.get(id) ?? null);
      });
    }
    return this.userLoader;
  }
}
