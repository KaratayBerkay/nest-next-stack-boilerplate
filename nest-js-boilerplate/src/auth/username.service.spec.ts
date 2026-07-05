import { UsernameService } from './username.service';

const mockFindUnique = jest.fn();

const mockTx = {
  user: {
    findUnique: mockFindUnique,
  },
};

describe('UsernameService', () => {
  let service: UsernameService;

  beforeEach(() => {
    service = new UsernameService();
    mockFindUnique.mockReset();
  });

  it('generates a username from the local part of the email', async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await service.generate('alice@example.com', mockTx as any);
    expect(result).toBe('alice');
  });

  it('lowercases and strips special characters', async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await service.generate(
      'ALICE.SMITH+tag@example.com',
      mockTx as any,
    );
    expect(result).toBe('alicesmithtag');
  });

  it('pads short local parts to MIN_LENGTH with underscores', async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await service.generate('a@b.com', mockTx as any);
    expect(result).toBe('a__');
  });

  it('truncates long local parts and preserves the collision suffix', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const long = 'a'.repeat(50);
    const result = await service.generate(`${long}@example.com`, mockTx as any);
    expect(result).toHaveLength(30);
    expect(result).toBe('a'.repeat(30));
  });

  it('appends a suffix when the base username is taken', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 'existing' });
    mockFindUnique.mockResolvedValueOnce(null);
    const result = await service.generate('alice@example.com', mockTx as any);
    expect(result).toMatch(/^alice_/);
    expect(result.length).toBeGreaterThan('alice'.length);
  });

  it('truncates base to preserve the collision suffix within MAX_LENGTH', async () => {
    const longBase = 'a'.repeat(29);
    mockFindUnique.mockResolvedValueOnce({ id: 'existing' });
    mockFindUnique.mockResolvedValueOnce(null);
    const result = await service.generate(
      `${longBase}@example.com`,
      mockTx as any,
    );
    expect(result).toMatch(/^a+_/);
    expect(result.length).toBeLessThanOrEqual(30);
  });

  it('tries up to MAX_ATTEMPTS before falling back', async () => {
    mockFindUnique.mockResolvedValue({ id: 'taken' });
    const result = await service.generate('alice@example.com', mockTx as any);
    expect(result).toMatch(/^alice_/);
    expect(mockFindUnique).toHaveBeenCalledTimes(5);
  });

  it('returns a unique fallback when all attempts are exhausted', async () => {
    mockFindUnique.mockResolvedValue({ id: 'taken' });
    const result = await service.generate('alice@example.com', mockTx as any);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result).toMatch(/^alice_/);
  });
});
