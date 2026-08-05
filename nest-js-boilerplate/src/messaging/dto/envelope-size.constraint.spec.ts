import { validate } from 'class-validator';
import { SendMessageInput } from './send-message.input';
import { SendMessageRestDto } from './send-message-rest.dto';
import { MAX_ENVELOPE_JSON_BYTES } from './envelope-size.constraint';

describe('envelope size validation', () => {
  describe('SendMessageRestDto', () => {
    it('accepts a realistically-sized envelope', async () => {
      const dto = new SendMessageRestDto();
      dto.text = '';
      dto.envelope = {
        v: 1,
        senderDeviceId: 'device-1',
        ciphertext: 'a'.repeat(6800),
        nonce: 'b'.repeat(32),
        header: { dhPub: 'c'.repeat(64), pn: 0, n: 0 },
      };
      const errors = await validate(dto);
      expect(errors.some((e) => e.constraints?.['envelope-size'])).toBe(false);
    });

    it('rejects an envelope over the size cap', async () => {
      const dto = new SendMessageRestDto();
      dto.text = '';
      dto.envelope = { ciphertext: 'a'.repeat(MAX_ENVELOPE_JSON_BYTES) };
      const errors = await validate(dto);
      expect(errors.some((e) => e.constraints?.['envelope-size'])).toBe(true);
    });

    it('allows an omitted envelope', async () => {
      const dto = new SendMessageRestDto();
      dto.text = 'hello';
      const errors = await validate(dto);
      expect(errors.some((e) => e.constraints?.['envelope-size'])).toBe(false);
    });
  });

  describe('SendMessageInput', () => {
    it('rejects an envelope over the size cap', async () => {
      const input = new SendMessageInput();
      input.recipientId = '11111111-1111-4111-8111-111111111111';
      input.text = '';
      input.envelope = { ciphertext: 'a'.repeat(MAX_ENVELOPE_JSON_BYTES) };
      const errors = await validate(input);
      expect(errors.some((e) => e.constraints?.['envelope-size'])).toBe(true);
    });
  });
});
