import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * #24/#107 TypeORM. Standalone (not in AppModule — the app's ORM is Prisma,
 * #115). Combines the docs' root config (`forRoot`) and feature scope
 * (`forFeature`) in one self-contained module so the e2e can boot it in
 * isolation. Backed by an in-memory SQLite DB (`better-sqlite3`) so the proof
 * is hermetic — no shared Postgres state, no collision with Prisma's tables.
 * `autoLoadEntities` picks up the `forFeature` entities; `synchronize` creates
 * the schema on connect (dev/test only — never production).
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Photo]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class TypeormDemoModule {}
