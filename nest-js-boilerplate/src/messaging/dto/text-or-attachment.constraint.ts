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
 * validators and silently bypass the check).
 */
@ValidatorConstraint({ name: 'text-or-attachment', async: false })
export class TextOrAttachmentConstraint
  implements ValidatorConstraintInterface
{
  validate(_value: unknown, args?: ValidationArguments): boolean {
    const obj = args?.object as TextOrAttachmentObject | undefined;
    if (obj?.attachments && obj.attachments.length > 0) return true;
    if (obj?.envelope && typeof obj.envelope === 'object') return true;
    return (obj?.text ?? '').trim().length > 0;
  }

  defaultMessage(): string {
    return 'A message must contain either text or an attachment';
  }
}
