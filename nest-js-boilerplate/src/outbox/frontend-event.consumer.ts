import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, EachMessagePayload } from 'kafkajs';
import { ElasticsearchService } from './elasticsearch.service';

const TOPIC = 'frontend-events';
const CONSUMER_GROUP = 'frontend-events-indexer';

@Injectable()
export class FrontendEventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FrontendEventConsumer.name);
  private consumer: Consumer | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  async onModuleInit(): Promise<void> {
    const enabled =
      this.config.get<string>('FRONTEND_EVENTS_CONSUMER_ENABLED', 'true') ===
      'true';
    if (!enabled) {
      this.logger.log(
        'Frontend events consumer is disabled (FRONTEND_EVENTS_CONSUMER_ENABLED=false)',
      );
      return;
    }

    const broker = this.config.get<string>('KAFKA_BROKER') ?? 'localhost:9092';

    const kafka = new Kafka({
      clientId: 'nest-frontend-events',
      brokers: [broker],
    });

    this.consumer = kafka.consumer({
      groupId: CONSUMER_GROUP,
    });

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: TOPIC, fromBeginning: false });
      await this.consumer.run({
        eachMessage: async ({ message, partition }: EachMessagePayload) => {
          const raw = message.value?.toString();
          if (!raw) return;

          try {
            const parsed = JSON.parse(raw) as {
              events: Array<Record<string, unknown>>;
              receivedAt: string;
            };

            const docs = parsed.events.map(
              (event: Record<string, unknown>, i: number) => ({
                id: `${partition}-${message.offset}-${i}`,
                document: event,
              }),
            );

            await this.elasticsearch.bulk('frontend-events', docs);
          } catch (error) {
            this.logger.error(
              { error: String(error), raw },
              'Failed to process frontend event',
            );
          }
        },
      });
      this.logger.log(`Kafka consumer listening on topic "${TOPIC}"`);
    } catch (error) {
      this.logger.error(
        { error: String(error) },
        'Failed to connect Kafka consumer — frontend events will not be indexed',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.consumer?.disconnect();
    } catch {
      // ignore disconnect errors
    }
  }
}
