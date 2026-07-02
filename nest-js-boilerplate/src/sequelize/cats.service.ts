import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cat } from './cat.model';
import { CreateCatDto } from './dto/create-cat.dto';

/**
 * The `Cat` model class is injected by the `@InjectModel(Cat)` token (registered
 * by `SequelizeModule.forFeature`), typed `typeof Cat`. CRUD goes through
 * Sequelize's static model methods.
 */
@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat) private readonly catModel: typeof Cat) {}

  create(dto: CreateCatDto): Promise<Cat> {
    return this.catModel.create({
      name: dto.name,
      age: dto.age,
      breed: dto.breed,
    });
  }

  findAll(): Promise<Cat[]> {
    return this.catModel.findAll();
  }

  findOne(id: number): Promise<Cat | null> {
    return this.catModel.findByPk(id);
  }

  async remove(id: number): Promise<void> {
    const cat = await this.catModel.findByPk(id);
    if (cat) {
      await cat.destroy();
    }
  }
}
