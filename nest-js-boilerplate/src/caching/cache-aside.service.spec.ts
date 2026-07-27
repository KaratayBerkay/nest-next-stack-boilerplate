import { CacheAsideService } from './cache-aside.service';

function createRedisMock() {
  const store = new Map<string, string>();
  return {
    get: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setex: jest.fn((key: string, _ttl: number, value: string) => {
      store.set(key, value);
      return Promise.resolve('OK');
    }),
  };
}

describe('CacheAsideService', () => {
  it('revives Date fields after a JSON round-trip through Redis', async () => {
    const redis = createRedisMock();
    const service = new CacheAsideService(redis as never);

    const createdAt = new Date('2026-07-27T10:35:09.671Z');
    await service.set('cache:feed:test', { id: '1', createdAt }, 30);

    const cached = await service.get<{ id: string; createdAt: Date }>(
      'cache:feed:test',
    );

    // A plain string here is what previously crashed the strict
    // `DateTime.serialize(value instanceof Date ? ... : null)` GraphQL
    // scalar on every cache hit.
    expect(cached?.createdAt).toBeInstanceOf(Date);
    expect(cached?.createdAt.toISOString()).toBe(createdAt.toISOString());
  });

  it('getOrFetch returns a real Date instance on a cache hit, not a string', async () => {
    const redis = createRedisMock();
    const service = new CacheAsideService(redis as never);
    const createdAt = new Date('2026-07-22T15:18:38.246Z');

    const fetchFn = jest
      .fn<Promise<{ id: string; createdAt: Date }[]>, []>()
      .mockResolvedValue([{ id: 'p1', createdAt }]);

    await service.getOrFetch('cache:feed:posts', fetchFn, 30);
    const second = await service.getOrFetch('cache:feed:posts', fetchFn, 30);

    expect(fetchFn).toHaveBeenCalledTimes(1); // second call was a cache hit
    expect(second[0].createdAt).toBeInstanceOf(Date);
  });

  it('leaves ordinary strings alone', async () => {
    const redis = createRedisMock();
    const service = new CacheAsideService(redis as never);

    await service.set('cache:post:test', { title: 'not-a-date' }, 30);
    const cached = await service.get<{ title: string }>('cache:post:test');

    expect(cached?.title).toBe('not-a-date');
  });
});
