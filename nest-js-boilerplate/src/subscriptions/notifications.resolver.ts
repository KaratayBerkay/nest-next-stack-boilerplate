import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import type { PubSub } from 'graphql-subscriptions';
import { LiveNotification } from './models/live-notification.model';
import { PUB_SUB } from './pub-sub.provider';

// Trigger name the publisher fires on and the subscription listens to.
const NOTIFICATION_ADDED = 'notificationAdded';

@Resolver(() => LiveNotification)
export class NotificationsResolver {
  private nextId = 1;

  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  // A root Query is required for a valid GraphQL schema; this also lets the module stand
  // alone (the app's other resolvers supply queries, but the feature shouldn't depend on
  // them). Doubles as a readiness probe for the subscriptions transport.
  @Query(() => Boolean, { name: 'subscriptionsReady' })
  ready(): boolean {
    return true;
  }

  // Publisher: any client can drop a notification onto a channel. In a real app this
  // would live behind a guard / a domain event — here it is the simplest way to feed
  // the stream so the subscription has something to deliver.
  @Mutation(() => LiveNotification)
  publishNotification(
    @Args('channel') channel: string,
    @Args('message') message: string,
  ): LiveNotification {
    const notification: LiveNotification = {
      id: this.nextId++,
      channel,
      message,
    };
    // The payload key MUST match the subscription field name so Apollo can resolve it.
    void this.pubSub.publish(NOTIFICATION_ADDED, {
      notificationAdded: notification,
    });
    return notification;
  }

  // Subscription: streams notifications, but the `filter` scopes delivery to the
  // channel the subscriber asked for — proving server-side filtering from the docs.
  // `channel` is consumed by `filter` via `variables`, not in the body, hence `_channel`.
  @Subscription(() => LiveNotification, {
    filter: (
      payload: { notificationAdded: LiveNotification },
      variables: { channel: string },
    ) => payload.notificationAdded.channel === variables.channel,
  })
  notificationAdded(@Args('channel') _channel: string) {
    return this.pubSub.asyncIterableIterator<LiveNotification>(
      NOTIFICATION_ADDED,
    );
  }
}
