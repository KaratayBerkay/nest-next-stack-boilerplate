import { Module } from '@nestjs/common';
import { NotificationsResolver } from './notifications.resolver';
import { PubSubProvider } from './pub-sub.provider';

// GraphQL subscriptions feature (code-first, graphql-ws transport). The transport itself
// is enabled once at the root GraphQLModule via `subscriptions: { 'graphql-ws': true }`.
@Module({
  providers: [PubSubProvider, NotificationsResolver],
})
export class SubscriptionsModule {}
