import { Injectable } from '@nestjs/common';

/** Domain record returned by the repository. */
export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Automock/Suites (#119) — a real dependency of {@link UserService}. In production it would hit a
 * database; in the solitary unit test it is auto-mocked by Suites, so this body never runs there.
 */
@Injectable()
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return Promise.resolve({
      id,
      email: `${id}@example.com`,
      name: `User ${id}`,
    });
  }
}
