/**
 * Injection token for the shared ioredis client. Lives in its own file so that
 * providers injecting it (health indicator, token store) never import
 * `redis.module.ts` back — that circular import left the token `undefined` at
 * decorator-evaluation time and broke Nest DI on boot.
 */
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
