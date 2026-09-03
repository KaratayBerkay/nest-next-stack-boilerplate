import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * `POST /activity-logs` is unauthenticated (OptionalAuthGuard), and every
 * `metadata` object is logged straight through Pino → Fluentd → Elasticsearch,
 * where ES maps each nested key dynamically. Left unbounded (it was validated
 * only as `@IsObject()`), a caller could (a) ship large blobs on every request
 * and (b) mint unlimited unique `metadata.<key>` field names until the index
 * hits `index.mapping.total_fields.limit` and starts rejecting NEW fields —
 * degrading logging for the whole platform. Bound both the serialized size and
 * the top-level key count; the real telemetry this carries is small.
 */
export const MAX_METADATA_JSON_BYTES = 4096;
export const MAX_METADATA_KEYS = 24;

@ValidatorConstraint({ name: 'activity-metadata', async: false })
export class ActivityMetadataConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value !== 'object' || Array.isArray(value)) return false;
    if (Object.keys(value).length > MAX_METADATA_KEYS) return false;
    let serialized: string;
    try {
      serialized = JSON.stringify(value);
    } catch {
      // Circular / non-serializable — reject rather than risk throwing deeper
      // in the logging pipeline.
      return false;
    }
    return serialized.length <= MAX_METADATA_JSON_BYTES;
  }

  defaultMessage(): string {
    return `metadata must be an object with at most ${MAX_METADATA_KEYS} keys and serialize to at most ${MAX_METADATA_JSON_BYTES} bytes`;
  }
}
