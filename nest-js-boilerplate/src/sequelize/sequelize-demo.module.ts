import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cat } from './cat.model';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

/**
 * #109 Sequelize. Standalone (not in AppModule — the app's ORM is Prisma, #115).
 * Uses the out-of-the-box `@nestjs/sequelize` integration (the recipe page
 * recommends it over the hand-rolled custom-provider version). Backed by
 * in-memory SQLite for a hermetic proof. `autoLoadModels` registers the
 * forFeature models; `synchronize` creates the tables on connect (dev/test only).
 */
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: ':memory:',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
    SequelizeModule.forFeature([Cat]),
  ],
  controllers: [CatsController],
  providers: [CatsService],
})
export class SequelizeDemoModule {}
