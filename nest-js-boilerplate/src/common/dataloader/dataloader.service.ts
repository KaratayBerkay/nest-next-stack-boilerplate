import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import type { User } from '../../@generated/user/user.model';
import type { Post } from '../../@generated/post/post.model';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class DataloaderService {
  private userLoader: DataLoader<string, User | null> | null = null;
  private postLoader: DataLoader<string, Post | null> | null = null;

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

  getPostLoader(): DataLoader<string, Post | null> {
    if (!this.postLoader) {
      this.postLoader = new DataLoader<string, Post | null>(async (ids) => {
        const posts = await this.prisma.post.findMany({
          where: { id: { in: [...ids] } },
        });
        const map = new Map(posts.map((p) => [p.id, p]));
        return ids.map((id) => map.get(id) ?? null);
      });
    }
    return this.postLoader;
  }
}
