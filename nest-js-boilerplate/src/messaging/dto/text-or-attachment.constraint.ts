import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  type ValidationArguments,
} from 'class-validator';

interface TextOrAttachmentObject {
  text?: string | null;
  attachments?: { url?: string }[] | null;
  envelope?: Record<string, unknown> | null;
}

/**
 * Cross-field guard for chat sends: at least one of `text` / `attachments` /
 * `envelope` must be provided, otherwise an empty message is persisted (F34).
 * Applied via `@Validate` on the `text` field of every send DTO; `text` must
 * therefore not be marked `@IsOptional` (an omitted field would skip all its
 * validators and silently bypass this check).
 */
@ValidatorConstraint({ name: 'text-or-attachment', async: false })
export class TextOrAttachmentConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args?: ValidationArguments): boolean {
    const obj = args?.object as TextOrAttachmentObject | undefined;
    if (obj?.attachments && obj.attachments.length > 0) return true;
    if (obj?.envelope && typeof obj.envelope === 'object') return true;
    // REST bodies are untyped JSON — `text` can arrive as any value (e.g. a
    // number), and `(obj?.text ?? '').trim()` threw on anything without a
    // `.trim` method, crashing this synchronous validator instead of simply
    // failing the check.
    return typeof obj?.text === 'string' && obj.text.trim().length > 0;
  }

  defaultMessage(): string {
    return 'A message must contain either text or an attachment';
  }
}

/**
 * `text`'s own type/length check, split out from `@IsString()`/`@MaxLength()`
 * specifically so it can tolerate `text` being entirely absent (an
 * attachment-only or E2EE-envelope-only send) without using `@IsOptional()` —
 * which, on this property, would also gate `TextOrAttachmentConstraint`
 * above and silently readmit the fully-empty message this pair exists to
 * reject. `undefined`/`null` pass here; the emptiness check is
 * TextOrAttachmentConstraint's job, not this one's. Regression: previously
 * `text` had no `@IsOptional()` AND a bare `@IsString()`, so every
 * attachment-only or envelope-only message (no visible caption) was rejected
 * by validation before ever reaching the controller/resolver.
 */
@ValidatorConstraint({ name: 'optional-message-text', async: false })
export class OptionalMessageTextConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    return typeof value === 'string' && value.length <= 5000;
  }

  defaultMessage(): string {
    return 'text must be a string of at most 5000 characters';
  }
}
