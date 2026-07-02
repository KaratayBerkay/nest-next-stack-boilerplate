import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Book } from './book.entity';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

/**
 * #106 MikroORM. Standalone (not in AppModule — the app's ORM is Prisma, #115).
 * `forRoot` + `forFeature([Book])`; `autoLoadEntities` adds the forFeature
 * entities to the config. Backed by in-memory SQLite (`@mikro-orm/better-sqlite`)
 * for a hermetic proof. NB: MikroORM has no `synchronize` — the e2e creates the
 * schema via the SchemaGenerator after boot.
 */
@Module({
  imports: [
    MikroOrmModule.forRoot({
      driver: BetterSqliteDriver,
      dbName: ':memory:',
      autoLoadEntities: true,
    }),
    MikroOrmModule.forFeature([Book]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class MikroOrmDemoModule {}
