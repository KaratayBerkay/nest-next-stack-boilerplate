import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SendMessageInput } from './send-message.input';
import { SendMessageRestDto } from './send-message-rest.dto';

describe('F34 — text-or-attachment cross-field validation', () => {
  describe('SendMessageRestDto', () => {
    it('rejects fully empty message', async () => {
      const dto = new SendMessageRestDto();
      dto.text = '';
      const errors = await validate(dto);
      expect(errors.some((e) => e.constraints?.['text-or-attachment'])).toBe(
        true,
      );
    });

    it('rejects whitespace-only text without attachment', async () => {
      const dto = new SendMessageRestDto();
      dto.text = '   ';
      const errors = await validate(dto);
      expect(errors.some((e) => e.constraints?.['text-or-attachment'])).toBe(
        true,
      );
    });

    it('rejects omitted text without attachment', async () => {
      const errors = await validate(new SendMessageRestDto());
      expect(errors.some((e) => e.constraints?.['text-or-attachment'])).toBe(
        true,
      );
    });

    it('accepts text without attachment', async () => {
      const dto = new SendMessageRestDto();
      dto.text = 'hello';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('accepts attachment without text', async () => {
      const dto = plainToInstance(SendMessageRestDto, {
        text: '',
        attachments: [
          {
            url: 'https://minio/x.png',
            type: 'image/png',
            name: 'x.png',
          },
        ],
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('accepts an attachment with `text` entirely OMITTED (not an empty string) — regression: `text` had a bare `@IsString()` with no `@IsOptional()`, so a genuinely absent `text` key (the real shape an image-only send from a client actually produces) failed validation even though this exact case is what TextOrAttachmentConstraint is supposed to allow', async () => {
      const dto = plainToInstance(SendMessageRestDto, {
        attachments: [
          {
            url: 'https://minio/x.png',
            type: 'image/png',
            name: 'x.png',
          },
        ],
      });
      expect(dto.text).toBeUndefined();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('accepts an envelope-only (E2EE) send with `text` entirely omitted', async () => {
      const dto = plainToInstance(SendMessageRestDto, {
        envelope: { v: 1, ct: 'ciphertext', nonce: 'n' },
      });
      expect(dto.text).toBeUndefined();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('still rejects a fully empty message when text is omitted rather than an empty string — the F34 guard this pair exists to preserve', async () => {
      const dto = plainToInstance(SendMessageRestDto, {});
      expect(dto.text).toBeUndefined();
      const errors = await validate(dto);
      expect(errors.some((e) => e.constraints?.['text-or-attachment'])).toBe(
        true,
      );
    });

    it('rejects a non-string text value even when present', async () => {
      const dto = plainToInstance(SendMessageRestDto, { text: 12345 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.constraints?.['optional-message-text'])).toBe(
        true,
      );
    });
  });

  describe('SendMessageInput', () => {
    it('rejects fully empty message', async () => {
      const input = new SendMessageInput();
      input.recipientId = '11111111-1111-4111-8111-111111111111';
      input.text = '';
      const errors = await validate(input);
      expect(errors.some((e) => e.constraints?.['text-or-attachment'])).toBe(
        true,
      );
    });

    it('accepts attachment without text', async () => {
      const input = plainToInstance(SendMessageInput, {
        recipientId: '11111111-1111-4111-8111-111111111111',
        text: '',
        attachments: [
          {
            url: 'https://minio/x.pdf',
            type: 'application/pdf',
            name: 'x.pdf',
          },
        ],
      });
      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('accepts an attachment with `text` entirely omitted (not an empty string) — regression: a genuinely absent `text` field (nullable: true in the GraphQL schema, so callers legitimately omit it) failed validation the same way the REST DTO did', async () => {
      const input = plainToInstance(SendMessageInput, {
        recipientId: '11111111-1111-4111-8111-111111111111',
        attachments: [
          {
            url: 'https://minio/x.pdf',
            type: 'application/pdf',
            name: 'x.pdf',
          },
        ],
      });
      expect(input.text).toBeUndefined();
      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('still rejects a fully empty message when text is omitted rather than an empty string', async () => {
      const input = plainToInstance(SendMessageInput, {
        recipientId: '11111111-1111-4111-8111-111111111111',
      });
      expect(input.text).toBeUndefined();
      const errors = await validate(input);
      expect(errors.some((e) => e.constraints?.['text-or-attachment'])).toBe(
        true,
      );
    });
  });
});
