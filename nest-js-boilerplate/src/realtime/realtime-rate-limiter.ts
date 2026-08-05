export interface RealtimeRateLimiterConfig {
  socketRatePerSec: number;
  socketBurst: number;
  userRatePerSec: number;
  userBurst: number;
}

export type RealtimeLimitResult = 'ok' | 'socket' | 'user';

interface BucketState {
  tokens: number;
  lastRefill: number;
}

/**
 * In-memory token-bucket frame limiter for WebSocket inbound messages.
 * Buckets are per-socket and per-user (aggregated across the user's sockets),
 * so flooding from any single socket — or from many sockets of the same
 * account — is capped. State is intentionally local to this replica: a socket
 * is bound to the instance it connected to, and per-user state is released
 * once the user's last socket closes.
 */
export class RealtimeRateLimiter {
  private readonly sockets = new Map<string, BucketState>();
  private readonly users = new Map<string, BucketState>();

  constructor(private readonly cfg: RealtimeRateLimiterConfig) {}

  check(
    socketId: string | undefined,
    userId: string | null,
  ): RealtimeLimitResult {
    if (!socketId) return 'ok';
    if (
      !this.consume(
        this.sockets,
        socketId,
        this.cfg.socketRatePerSec,
        this.cfg.socketBurst,
      )
    ) {
      return 'socket';
    }
    if (
      userId &&
      !this.consume(
        this.users,
        userId,
        this.cfg.userRatePerSec,
        this.cfg.userBurst,
      )
    ) {
      return 'user';
    }
    return 'ok';
  }

  releaseSocket(socketId: string | undefined): void {
    if (socketId) this.sockets.delete(socketId);
  }

  releaseUser(userId: string): void {
    this.users.delete(userId);
  }

  clear(): void {
    this.sockets.clear();
    this.users.clear();
  }

  private consume(
    buckets: Map<string, BucketState>,
    key: string,
    refillPerSec: number,
    capacity: number,
  ): boolean {
    const now = Date.now();
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, { tokens: capacity - 1, lastRefill: now });
      return true;
    }
    const state = existing;
    const elapsedSec = (now - state.lastRefill) / 1000;
    if (elapsedSec > 0) {
      state.tokens = Math.min(
        capacity,
        state.tokens + elapsedSec * refillPerSec,
      );
      state.lastRefill = now;
    }
    if (state.tokens >= 1) {
      state.tokens -= 1;
      return true;
    }
    return false;
  }
}
