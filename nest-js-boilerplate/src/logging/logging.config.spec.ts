import { buildPinoHttpOptions } from './logging.config';

interface MultiTransport {
  targets: {
    target: string;
    options?: { destination?: unknown; mkdir?: boolean };
  }[];
}

describe('buildPinoHttpOptions', () => {
  it('prod without LOG_FILE writes raw JSON to stdout (no transport) at level info', () => {
    const opts = buildPinoHttpOptions({ nodeEnv: 'production' });
    expect(opts.transport).toBeUndefined();
    expect(opts.level).toBe('info');
  });

  it('dev pretty-prints to the console at level debug', () => {
    const opts = buildPinoHttpOptions({ nodeEnv: 'development' });
    expect(opts.transport).toMatchObject({ target: 'pino-pretty' });
    expect(opts.level).toBe('debug');
  });

  it('LOG_FILE adds a pino/file target for the Fluent Bit -> Elasticsearch pipeline', () => {
    const opts = buildPinoHttpOptions({
      nodeEnv: 'production',
      logFile: 'logs/app.log',
    });
    const { targets } = opts.transport as unknown as MultiTransport;
    // Console target is still present...
    expect(targets.some((t) => t.options?.destination === 1)).toBe(true);
    // ...plus the file sink the collector tails.
    const file = targets.find(
      (t) =>
        t.target === 'pino/file' && t.options?.destination === 'logs/app.log',
    );
    expect(file).toBeDefined();
    expect(file?.options?.mkdir).toBe(true);
  });

  it('LOG_LEVEL overrides the default', () => {
    expect(
      buildPinoHttpOptions({ nodeEnv: 'production', logLevel: 'warn' }).level,
    ).toBe('warn');
  });

  it('emits ISO timestamps so Elasticsearch maps @timestamp cleanly', () => {
    const opts = buildPinoHttpOptions({ nodeEnv: 'production' });
    // pino's isoTime renders as `,"time":"2026-..."` (string), not an epoch number.
    expect(typeof opts.timestamp).toBe('function');
    const rendered = (opts.timestamp as () => string)();
    expect(rendered).toMatch(/^,"time":"\d{4}-\d{2}-\d{2}T/);
  });
});
