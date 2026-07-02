import { Module } from '@nestjs/common';
import { DogsController } from './dogs.controller';

/** Companion module for the multiple-specifications proof (see DogsController). */
@Module({
  controllers: [DogsController],
})
export class DogsModule {}
