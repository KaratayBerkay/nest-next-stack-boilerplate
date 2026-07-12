/**
 * Injection token for the shared ioredis client. Lives in its own file so that
 * providers injecting it (health indicator, token store) never import
 * `redis.module.ts` back — that circular import left the token `undefined` at
 * decorator-evaluation time and broke Nest DI on boot.
 */
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

/**
 * Injection token for a separate Redis connection used exclusively for pub/sub.
 * Redis blocks a connection in subscriber mode, so this must be a dedicated
 * client (typically created via `client.duplicate()`). Only needed when the
 * app runs in multi-replica mode.
 */
export const REDIS_SUBSCRIBER = Symbol('REDIS_SUBSCRIBER');
