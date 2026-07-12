import { Injectable, OnModuleDestroy } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DataloaderService implements OnModuleDestroy {
  private readonly loaders = new Map<string, DataLoader<string, unknown>>();

  constructor(private readonly prisma: PrismaService) {}

  onModuleDestroy() {
    for (const loader of this.loaders.values()) {
      loader.clearAll();
    }
    this.loaders.clear();
  }

  getUserLoader(): DataLoader<string, unknown> {
    const key = 'user';
    if (!this.loaders.has(key)) {
      this.loaders.set(
        key,
        new DataLoader<string, unknown>(async (ids) => {
          const users = await this.prisma.user.findMany({
            where: { id: { in: [...ids] } },
          });
          const map = new Map(users.map((u) => [u.id, u]));
          return ids.map((id) => map.get(id) ?? null);
        }),
      );
    }
    return this.loaders.get(key)!;
  }

  getPostLoader(): DataLoader<string, unknown> {
    const key = 'post';
    if (!this.loaders.has(key)) {
      this.loaders.set(
        key,
        new DataLoader<string, unknown>(async (ids) => {
          const posts = await this.prisma.post.findMany({
            where: { id: { in: [...ids] } },
          });
          const map = new Map(posts.map((p) => [p.id, p]));
          return ids.map((id) => map.get(id) ?? null);
        }),
      );
    }
    return this.loaders.get(key)!;
  }
}
