import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

let sdk: NodeSDK | null = null;

/**
 * Initialize the OpenTelemetry SDK with auto-instrumentations for HTTP, GraphQL,
 * Prisma, ioredis, and kafkajs. Call this BEFORE NestFactory.create() so all
 * instrumentations are active before any modules load.
 *
 * Traces are exported via OTLP/HTTP (default collector at http://localhost:4318).
 * Set OTEL_EXPORTER_OTLP_ENDPOINT to override.
 */
export function initOpenTelemetry(): void {
  const serviceName =
    process.env.OTEL_SERVICE_NAME ?? 'nest-next-stack-backend';
  const serviceVersion = process.env.npm_package_version ?? '0.0.0';

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
  });

  const metricExporter = new OTLPMetricExporter();
  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: Number(
      process.env.OTEL_METRIC_EXPORT_INTERVAL_MS ?? 30_000,
    ),
  });

  sdk = new NodeSDK({
    resource,
    metricReader,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable filesystem instrumentation — too noisy for NestJS
        '@opentelemetry/instrumentation-fs': { enabled: false },
        // Disable winston/pino to avoid double-logging
        '@opentelemetry/instrumentation-winston': { enabled: false },
      }),
    ],
  });

  try {
    sdk.start();
    logger.log('OpenTelemetry initialized');
  } catch (err) {
    logger.warn(
      'OpenTelemetry failed to start — continuing without tracing',
      err as Error,
    );
  }
}

/**
 * Flush pending spans/metrics and shut down the SDK. Call on SIGTERM/SIGINT.
 */
export async function shutdownOpenTelemetry(): Promise<void> {
  if (sdk) {
  // Enable OTel diagnostic logging so export failures and internal warnings
  // are visible instead of silently swallowed.
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  try {
      await sdk.shutdown();
      logger.log('OpenTelemetry shut down');
    } catch (err) {
      logger.warn('OpenTelemetry shutdown error', err as Error);
    }
  }
}
