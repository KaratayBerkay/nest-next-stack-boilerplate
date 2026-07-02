import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import type { User } from './user.repository';

/**
 * Automock/Suites (#119) — the unit under test. It has two constructor dependencies
 * ({@link UserRepository} and the Nest {@link Logger}); Suites' `TestBed.solitary(UserService)`
 * discovers them from the emitted decorator metadata and replaces both with auto-generated mocks,
 * so the spec configures behaviour without hand-writing stub classes or a Nest testing module.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async findById(id: string): Promise<User> {
    this.logger.log(`Looking up user ${id}`);
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }
}
