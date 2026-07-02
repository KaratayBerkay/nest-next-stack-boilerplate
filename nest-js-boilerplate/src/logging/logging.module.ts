import { Module, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { buildPinoHttpOptions } from './logging.config';

/**
 * Application logging.
 *
 * Replaces NestJS's built-in console `Logger` with **Pino** (`nestjs-pino`): structured JSON,
 * async/off the hot path, automatic per-request logs, secret redaction, and request-id
 * correlation. Existing `new Logger(Foo.name)` call sites keep working — they are bridged onto
 * Pino once `main.ts` calls `app.useLogger(app.get(Logger))`.
 *
 * See `docs/backend/research/logger.md` for why the built-in logger was rejected and the transport
 * options (stdout → collector → Loki/ELK) this feeds.
 */
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: buildPinoHttpOptions({
          nodeEnv: config.get<string>('NODE_ENV'),
          logLevel: config.get<string>('LOG_LEVEL'),
          logFile: config.get<string>('LOG_FILE'),
        }),
        // Liveness/readiness probes fire constantly; don't drown the log in them.
        exclude: [
          { method: RequestMethod.ALL, path: 'health' },
          { method: RequestMethod.ALL, path: 'health/ready' },
        ],
      }),
    }),
  ],
})
export class LoggingModule {}
