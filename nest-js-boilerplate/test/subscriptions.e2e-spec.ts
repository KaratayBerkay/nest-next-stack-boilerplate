/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { Client, createClient } from 'graphql-ws';
import request from 'supertest';
import { SubscriptionsModule } from '../src/subscriptions/subscriptions.module';

// Proves GraphQL subscriptions end-to-end over the graphql-ws transport: a real
// graphql-ws client subscribes, an HTTP mutation publishes onto the shared PubSub, and
// the event is pushed back down the websocket. Also proves the documented `filter`
// option — events on the wrong channel never reach the subscriber.
//
// The transport gives no ack that a subscription is registered server-side, so instead
// of sleeping we *pump*: keep publishing until the first event is delivered. Any events
// published before the subscription is live are simply missed, which is fine.

type Notification = { id: number; channel: string; message: string };
type AddedPayload = { notificationAdded: Notification };

describe('GraphQL subscriptions (e2e)', () => {
  let app: INestApplication;
  let wsUrl: string;
  let client: Client;

  const publish = (channel: string, message: string) =>
    request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation ($channel: String!, $message: String!) {
          publishNotification(channel: $channel, message: $message) { id }
        }`,
        variables: { channel, message },
      });

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true, // in-memory schema; don't touch src/schema.gql
          subscriptions: { 'graphql-ws': true },
        }),
        SubscriptionsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(0);
    const httpUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
    wsUrl = `${httpUrl.replace('http', 'ws')}/graphql`;
    // No webSocketImpl needed: graphql-ws picks up Node's global WebSocket (Node 24).
    client = createClient({ url: wsUrl });
  });

  afterAll(async () => {
    await client?.dispose();
    await app?.close();
  });

  it('pushes a published event to a subscribed client and filters by channel', async () => {
    let received: Notification | undefined;
    const firstEvent = new Promise<Notification>((resolve, reject) => {
      client.subscribe<AddedPayload>(
        {
          query: `subscription ($channel: String!) {
            notificationAdded(channel: $channel) { id channel message }
          }`,
          variables: { channel: 'alerts' },
        },
        {
          next: ({ data }) => {
            if (data && !received) {
              received = data.notificationAdded;
              resolve(received);
            }
          },
          error: reject,
          complete: () => {},
        },
      );
    });

    // Pump both a decoy ('noise') and the real channel ('alerts') until one lands.
    for (let i = 0; i < 50 && !received; i++) {
      await publish('noise', 'should-be-filtered-out');
      await publish('alerts', 'hello-subscribers');
      await sleep(100);
    }

    const event = await firstEvent;
    expect(event.channel).toBe('alerts'); // 'noise' was filtered out
    expect(event.message).toBe('hello-subscribers');
  });

  it('streams a continuous sequence of events to one subscription', async () => {
    const events: Notification[] = [];
    const gotTwo = new Promise<void>((resolve, reject) => {
      client.subscribe<AddedPayload>(
        {
          query: `subscription ($channel: String!) {
            notificationAdded(channel: $channel) { id channel message }
          }`,
          variables: { channel: 'stream' },
        },
        {
          next: ({ data }) => {
            if (data) {
              events.push(data.notificationAdded);
              if (events.length >= 2) resolve();
            }
          },
          error: reject,
          complete: () => {},
        },
      );
    });

    for (let i = 0; i < 50 && events.length < 2; i++) {
      await publish('stream', `event-${i}`);
      await sleep(100);
    }

    await gotTwo;
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events.every((e) => e.channel === 'stream')).toBe(true);
    expect(events[1].id).toBeGreaterThan(events[0].id); // monotonic, real stream
  });
});
