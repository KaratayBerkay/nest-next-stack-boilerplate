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
  });
});
