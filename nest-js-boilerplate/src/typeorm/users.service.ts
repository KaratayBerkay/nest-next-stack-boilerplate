import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Photo } from './entities/photo.entity';
import { User } from './entities/user.entity';

/**
 * The documented repository pattern: the `User` repository is injected by the
 * `@InjectRepository(User)` token (registered by `TypeOrmModule.forFeature`),
 * typed as `Repository<User>`. No hand-written data layer — TypeORM provides it.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      photos: (dto.photos ?? []).map((url) => {
        const photo = new Photo();
        photo.url = url;
        return photo;
      }),
    });
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: { photos: true } });
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { photos: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
