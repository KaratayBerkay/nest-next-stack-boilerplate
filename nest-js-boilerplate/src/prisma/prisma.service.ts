import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const SLOW_QUERY_THRESHOLD_MS = 500;

// Prisma 7 connects through a driver adapter (here: node-postgres) instead of an
// inline datasource URL. The connection string comes from ConfigService, whose
// ConfigModule has already loaded .env by the time this provider is constructed.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
      ],
    });

    (
      this as unknown as {
        $on: (event: string, cb: (e: Record<string, unknown>) => void) => void;
      }
    ).$on('query', (e) => {
      if ((e.duration as number) > SLOW_QUERY_THRESHOLD_MS) {
        this.logger.log({
          category: 'database',
          event: 'db.query_slow',
          query: e.query,
          durationMs: e.duration,
        });
      }
    });

    (
      this as unknown as {
        $on: (event: string, cb: (e: Record<string, unknown>) => void) => void;
      }
    ).$on('error', (e) => {
      this.logger.log({
        category: 'database',
        event: 'db.query_error',
        errorMessage: e.message,
      });
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
