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

    // Retry connect with exponential backoff — Kafka may not be ready on first boot
    // (e.g. broker still electing controller / auto-creating topics).
    const MAX_RETRIES = 10;
    const BASE_DELAY_MS = 500;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.consumer.connect();
        lastError = undefined;
        break;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
          this.logger.warn(
            `Kafka connect attempt ${attempt}/${MAX_RETRIES} failed, retrying in ${delay}ms`,
            err as Error,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (lastError) {
      this.logger.error(
        {
          error:
            lastError instanceof Error ? lastError.message : 'Unknown error',
        },
        'Failed to connect Kafka consumer after retries — frontend events will not be indexed',
      );
      return;
    }

    try {
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
        'Failed to subscribe Kafka consumer',
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
