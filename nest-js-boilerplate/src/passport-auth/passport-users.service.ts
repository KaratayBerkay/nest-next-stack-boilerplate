import { Injectable } from '@nestjs/common';

// The user as exposed to the rest of the app (no password).
export interface PassportUser {
  userId: number;
  username: string;
}

interface StoredUser extends PassportUser {
  password: string;
}

// In-memory user store (the recipe's hardcoded users) so this Passport demo needs no database.
@Injectable()
export class PassportUsersService {
  private readonly users: StoredUser[] = [
    { userId: 1, username: 'alice', password: 'guess' },
    { userId: 2, username: 'bob', password: 'frieren' },
  ];

  findOne(username: string): StoredUser | undefined {
    return this.users.find((user) => user.username === username);
  }
}
