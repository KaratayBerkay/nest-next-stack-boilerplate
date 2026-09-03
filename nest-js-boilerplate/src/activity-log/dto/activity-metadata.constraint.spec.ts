// FrontendEventDto (imported below) carries class-transformer `@Type`
// decorators, which read reflect metadata at module-load; the app loads
// reflect-metadata at bootstrap, so make this spec self-sufficient when run
// in isolation too.
import 'reflect-metadata';
import { validate } from 'class-validator';
import {
  ActivityMetadataConstraint,
  MAX_METADATA_JSON_BYTES,
  MAX_METADATA_KEYS,
} from './activity-metadata.constraint';
import { FrontendEventDto } from './log-activity.dto';

describe('ActivityMetadataConstraint', () => {
  const c = new ActivityMetadataConstraint();

  it('accepts undefined/null (metadata is optional)', () => {
    expect(c.validate(undefined)).toBe(true);
    expect(c.validate(null)).toBe(true);
  });

  it('accepts a small object', () => {
    expect(c.validate({ a: 1, b: 'two', c: true })).toBe(true);
  });

  it('rejects a non-object (array, primitive)', () => {
    expect(c.validate([1, 2, 3])).toBe(false);
    expect(c.validate('nope')).toBe(false);
    expect(c.validate(42)).toBe(false);
  });

  it('rejects too many top-level keys (ES dynamic-mapping field explosion)', () => {
    const many: Record<string, number> = {};
    for (let i = 0; i <= MAX_METADATA_KEYS; i++) many[`k${i}`] = i;
    expect(c.validate(many)).toBe(false);
  });

  it('rejects an oversized blob', () => {
    expect(c.validate({ big: 'a'.repeat(MAX_METADATA_JSON_BYTES) })).toBe(
      false,
    );
  });

  it('rejects a circular object rather than letting JSON.stringify throw downstream', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(c.validate(circular)).toBe(false);
  });

  it('is wired onto FrontendEventDto.metadata', async () => {
    const dto = new FrontendEventDto();
    dto.eventType = 'e';
    dto.clientSessionId = 's';
    dto.timestamp = new Date().toISOString();
    const many: Record<string, number> = {};
    for (let i = 0; i <= MAX_METADATA_KEYS; i++) many[`k${i}`] = i;
    dto.metadata = many;
    const errors = await validate(dto);
    expect(errors.some((e) => e.constraints?.['activity-metadata'])).toBe(true);
  });
});
