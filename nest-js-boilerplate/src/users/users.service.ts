import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserCreateInput } from '../@generated/user/user-create.input';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ orderBy: { id: 'asc' } });
  }

  create(data: UserCreateInput) {
    return this.prisma.user.create({
      data: { email: data.email, name: data.name },
    });
  }
}
