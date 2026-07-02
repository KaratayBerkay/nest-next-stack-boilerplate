import { Logger, NotFoundException } from '@nestjs/common';
import { TestBed } from '@suites/unit';
import type { Mocked } from '@suites/unit';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import type { User } from './user.repository';

// Proves the Automock/Suites recipe (#119). TestBed.solitary(UserService) auto-mocks every
// constructor dependency (UserRepository, Logger) without a Nest testing module or hand-written
// stubs; unitRef.get(Dep) hands back the typed mock so the spec can both program behaviour and
// assert calls. Covers solitary auto-mocking, the .mock().impl() pre-configured form, and a path
// where the mocked repository drives a thrown NotFoundException.
describe('UserService (Automock/Suites #119)', () => {
  describe('solitary auto-mocking', () => {
    let userService: UserService;
    let repository: Mocked<UserRepository>;
    let logger: Mocked<Logger>;

    beforeAll(async () => {
      const { unit, unitRef } = await TestBed.solitary(UserService).compile();
      userService = unit;
      repository = unitRef.get(UserRepository);
      logger = unitRef.get(Logger);
    });

    it('returns the user the (mocked) repository resolves, and logs the lookup', async () => {
      const user: User = { id: '1', email: 'test@example.com', name: 'Test' };
      repository.findById.mockResolvedValue(user);

      const result = await userService.findById('1');

      expect(result).toEqual(user);
      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(logger.log).toHaveBeenCalledWith('Looking up user 1');
    });

    it('throws NotFoundException when the mocked repository yields null', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(userService.findById('404')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  it('supports pre-configured mocks via .mock(Dep).impl(...)', async () => {
    const seeded: User = { id: '7', email: 'felix@example.com', name: 'Felix' };
    const { unit } = await TestBed.solitary(UserService)
      .mock(UserRepository)
      .impl((stubFn) => ({
        findById: stubFn().mockResolvedValue(seeded),
      }))
      .compile();

    await expect(unit.findById('7')).resolves.toEqual(seeded);
  });
});
