import { PubSub } from 'graphql-subscriptions';

// A single in-memory PubSub instance shared across the feature. The docs use a
// module-level `const pubSub = new PubSub()`; we expose it through Nest DI instead so
// resolvers (and tests) receive the same instance and it stays mockable/swappable
// (e.g. for a Redis-backed PubSub in production).
export const PUB_SUB = 'PUB_SUB';

export const PubSubProvider = {
  provide: PUB_SUB,
  useValue: new PubSub(),
};
