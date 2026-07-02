import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { mongooseUri } from './mongoose-uri';
import { Cat, CatSchema } from './schemas/cat.schema';

/**
 * #25/#108 Mongoose. Standalone (not in AppModule — the app's data layer is
 * Prisma, #115). `forRoot` opens the connection to the dev Mongo container
 * (`docker compose --profile mongo up`) on a per-run database; `forFeature`
 * registers the `Cat` model in this scope.
 */
@Module({
  imports: [
    MongooseModule.forRoot(mongooseUri()),
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
  ],
  controllers: [CatsController],
  providers: [CatsService],
})
export class MongooseDemoModule {}
