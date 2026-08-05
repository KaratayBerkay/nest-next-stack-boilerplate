import { RealtimeRateLimiter } from './realtime-rate-limiter';

describe('RealtimeRateLimiter', () => {
  let limiter: RealtimeRateLimiter;

  beforeEach(() => {
    jest.useFakeTimers();
    limiter = new RealtimeRateLimiter({
      socketRatePerSec: 10,
      socketBurst: 5,
      userRatePerSec: 20,
      userBurst: 10,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows frames within the socket burst capacity', () => {
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('s1', 'u1')).toBe('ok');
    }
  });

  it('rejects a socket frame beyond the burst capacity', () => {
    for (let i = 0; i < 5; i++) limiter.check('s1', 'u1');
    expect(limiter.check('s1', 'u1')).toBe('socket');
  });

  it('refills socket tokens over time', () => {
    for (let i = 0; i < 5; i++) limiter.check('s1', 'u1');
    expect(limiter.check('s1', 'u1')).toBe('socket');
    jest.advanceTimersByTime(1000);
    expect(limiter.check('s1', 'u1')).toBe('ok');
  });

  it('enforces the per-user aggregate across multiple sockets', () => {
    for (let i = 0; i < 5; i++) {
      expect(limiter.check(`s${i}`, 'u1')).toBe('ok');
    }
    for (let i = 5; i < 10; i++) {
      expect(limiter.check(`s${i}`, 'u1')).toBe('ok');
    }
    expect(limiter.check('s10', 'u1')).toBe('user');
  });

  it('does not count a socket against the user bucket when anonymous', () => {
    for (let i = 0; i < 5; i++) {
      expect(limiter.check(`s${i}`, null)).toBe('ok');
    }
    for (let i = 5; i < 100; i++) {
      expect(limiter.check(`s${i}`, null)).toBe('ok');
    }
  });

  it('resets the user bucket once released', () => {
    for (let i = 0; i < 10; i++) limiter.check(`s${i}`, 'u1');
    expect(limiter.check('s10', 'u1')).toBe('user');
    limiter.releaseUser('u1');
    expect(limiter.check('s11', 'u1')).toBe('ok');
  });

  it('resets the socket bucket once released', () => {
    for (let i = 0; i < 5; i++) limiter.check('s1', 'u1');
    expect(limiter.check('s1', 'u1')).toBe('socket');
    limiter.releaseSocket('s1');
    expect(limiter.check('s1', 'u1')).toBe('ok');
  });

  it('clears all state', () => {
    for (let i = 0; i < 5; i++) limiter.check('s1', 'u1');
    limiter.clear();
    expect(limiter.check('s1', 'u1')).toBe('ok');
  });

  it('snapshots bucket tokens for a rate-limited frame', () => {
    for (let i = 0; i < 5; i++) limiter.check('s1', 'u1');
    expect(limiter.check('s1', 'u1')).toBe('socket');
    const snap = limiter.snapshot('s1', 'u1');
    expect(snap.socket).toEqual({
      tokens: 0,
      capacity: 5,
      refillPerSec: 10,
    });
    expect(snap.user).toEqual({
      tokens: 5,
      capacity: 10,
      refillPerSec: 20,
    });
  });

  it('snapshots null for untracked keys', () => {
    expect(limiter.snapshot('nope', 'nobody')).toEqual({
      socket: null,
      user: null,
    });
  });
});
