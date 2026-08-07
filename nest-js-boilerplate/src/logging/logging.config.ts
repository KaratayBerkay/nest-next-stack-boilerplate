import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { stdTimeFunctions } from 'pino';
import type { Options } from 'pino-http';
import { getRequestId } from './request-context';

// pino-http augments the request with `id` (the result of genReqId). Narrow, not `any`.
type RequestWithId = IncomingMessage & { id?: string };

type RequestWithBody = IncomingMessage & { body?: { query?: unknown } };

/**
 * Pulls the GraphQL operation name out of a /graphql request body *without*
 * ever logging variables or credentials. The body is parsed by express.json()
 * long before the pino-http request log emits (request completion), so the op
 * name is available here even though pino-http never serializes the body.
 */
export function extractGraphqlOperation(
  req: RequestWithBody,
): string | undefined {
  if (typeof req.body?.query !== 'string') return undefined;
  // Real query/mutation constants are template literals that start with a
  // newline + indentation before the keyword (e.g. `\n  mutation Refresh {`)
  // — the leading \s* is required or every real request falls through to
  // 'anonymous'.
  const match = /^\s*(?:query|mutation|subscription)\s+([A-Za-z0-9_]+)/.exec(
    req.body.query,
  );
  return match ? match[1] : 'anonymous';
}

export interface LoggingEnv {
  /** `process.env.NODE_ENV`; controls pretty-vs-JSON output and the default level. */
  nodeEnv?: string;
  /** `LOG_LEVEL` override (trace|debug|info|warn|error|fatal). */
  logLevel?: string;
  /**
   * `LOG_FILE` — when set, also write raw JSON lines to this path (in addition to the console).
   * This is the file the Fluent Bit collector tails and ships to Elasticsearch (the `logging`
   * compose profile). Unset in plain local dev → console only.
   */
  logFile?: string;
}

/**
 * Builds the `pino-http` options used by {@link LoggingModule}. Exported as a pure function so
 * the proof test can exercise the exact same genReqId/customProps/redact behavior the app runs.
 *
 *  - **Console:** dev → `pino-pretty`; prod → raw JSON to stdout.
 *  - **File sink (opt-in via `LOG_FILE`):** raw JSON appended to a file for Fluent Bit → ES.
 *  - **Request id** comes from {@link getRequestId} (set by `requestContextMiddleware`), so the
 *    log's `req.id`, the `x-request-id` response header, and `AuditLog.correlationId` all match.
 *  - **ISO timestamps** so Elasticsearch maps `@timestamp` cleanly.
 *  - **Redaction** strips credentials so auth headers / cookies never reach the log backend.
 */
export function buildPinoHttpOptions(env: LoggingEnv): Options {
  const isProd = env.nodeEnv === 'production';
  // The console destination: pretty text in dev, raw JSON in prod.
  const consoleTarget = isProd
    ? { target: 'pino/file', options: { destination: 1 } } // fd 1 = stdout, raw JSON
    : { target: 'pino-pretty', options: { singleLine: true } };

  let transport: Options['transport'];
  if (env.logFile) {
    // Console + an append-only JSON file the collector (Fluent Bit) tails → Elasticsearch.
    transport = {
      targets: [
        consoleTarget,
        {
          target: 'pino/file',
          options: { destination: env.logFile, mkdir: true },
        },
      ],
    };
  } else {
    // No file sink: dev pretty-prints; prod writes raw JSON straight to stdout (no transport).
    transport = isProd
      ? undefined
      : { target: 'pino-pretty', options: { singleLine: true } };
  }

  return {
    level: env.logLevel ?? (isProd ? 'info' : 'debug'),
    timestamp: stdTimeFunctions.isoTime,
    transport,
    // Single source of truth for the id (see request-context.ts); fall back defensively.
    genReqId: () => getRequestId() ?? randomUUID(),
    // Surface the id under the name the audit trail uses, so logs and AuditLog join cleanly.
    customProps: (req) => {
      const graphql = extractGraphqlOperation(req);
      return {
        correlationId: (req as RequestWithId).id,
        // Annotate /graphql request logs with the operation name so the
        // different mutations (login vs refresh vs me) are distinguishable
        // in ELK. Variables/credentials are never read, only the op name.
        ...(graphql ? { graphql } : {}),
      };
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
      remove: true,
    },
  };
}
