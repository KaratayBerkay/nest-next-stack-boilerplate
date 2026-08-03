import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * A real E2EE envelope (ciphertext + header + optional X3DH preamble, all
 * derived from a 5000-char plaintext cap) comes out to roughly 8-10 KB at
 * most. This caps it with a generous safety margin — defense-in-depth
 * against a malicious or buggy client sending an arbitrarily large
 * `envelope` blob, which is otherwise validated only as "is an object"
 * (no deep shape validation, since the shape is expected to evolve) and
 * would otherwise land unbounded in a Postgres JSONB column and get
 * relayed as-is over WS to every connected tab.
 */
export const MAX_ENVELOPE_JSON_BYTES = 32_768;

@ValidatorConstraint({ name: 'envelope-size', async: false })
export class EnvelopeSizeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value !== 'object') return false;
    let serialized: string;
    try {
      serialized = JSON.stringify(value);
    } catch {
      return false;
    }
    return serialized.length <= MAX_ENVELOPE_JSON_BYTES;
  }

  defaultMessage(): string {
    return `envelope must serialize to at most ${MAX_ENVELOPE_JSON_BYTES} bytes`;
  }
}
