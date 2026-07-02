import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];

  // Federation passes the @key as an ID (string on the wire), so coerce before matching.
  findById(id: number | string): User | undefined {
    return this.users.find((u) => u.id === Number(id));
  }
}
