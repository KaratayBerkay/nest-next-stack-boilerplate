import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './schemas/cat.schema';

/**
 * The `Cat` model is injected by the `@InjectModel(Cat.name)` token (registered
 * by `MongooseModule.forFeature`), typed `Model<Cat>`. CRUD goes through the
 * Mongoose model — `new this.catModel(dto).save()`, `find`, `findById`, etc.
 */
@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  create(dto: CreateCatDto): Promise<Cat> {
    return new this.catModel(dto).save();
  }

  findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }

  findOne(id: string): Promise<Cat | null> {
    return this.catModel.findById(id).exec();
  }

  async remove(id: string): Promise<void> {
    await this.catModel.findByIdAndDelete(id).exec();
  }
}
