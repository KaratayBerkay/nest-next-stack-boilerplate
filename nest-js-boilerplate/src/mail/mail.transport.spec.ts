import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailTransport } from './mail.transport';

// Mock the Resend SDK with a factory so the real module is never loaded and no network call is
// ever made. `mockSend` is mock-prefixed so jest allows referencing it inside the factory.
const mockSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({ emails: { send: mockSend } })),
}));

const ResendMock = Resend as unknown as jest.Mock;

/** Minimal ConfigService stub honoring the (key, default) signature MailTransport uses. */
const makeConfig = (
  values: Record<string, string | undefined>,
): ConfigService =>
  ({
    get: (key: string, def?: unknown) => values[key] ?? def,
  }) as unknown as ConfigService;

describe('MailTransport', () => {
  beforeEach(() => {
    ResendMock.mockClear();
    mockSend.mockReset();
  });

  it('falls back to the dev transport (no Resend client) when no API key is set', async () => {
    const transport = new MailTransport(makeConfig({}));

    const result = await transport.send({ to: 'a@b.com', subject: 'Hi' });

    expect(result).toEqual({ provider: 'dev' });
    expect(ResendMock).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sends via Resend and maps the returned message id when a key is set', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

    const transport = new MailTransport(
      makeConfig({ RESEND_API_KEY: 're_test', MAIL_FROM: 'from@app.dev' }),
    );
    const result = await transport.send({ to: 'a@b.com', subject: 'Hi' });

    expect(ResendMock).toHaveBeenCalledWith('re_test');
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'from@app.dev',
        to: 'a@b.com',
        subject: 'Hi',
      }),
    );
    expect(result).toEqual({ provider: 'resend', messageId: 'msg_123' });
  });

  it('forwards MAIL_REPLY_TO as replyTo when configured', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_456' }, error: null });

    const transport = new MailTransport(
      makeConfig({ RESEND_API_KEY: 're_test', MAIL_REPLY_TO: 'me@gmail.com' }),
    );
    await transport.send({ to: 'a@b.com', subject: 'Hi' });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: 'me@gmail.com' }),
    );
  });

  it('omits replyTo when MAIL_REPLY_TO is not set', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_789' }, error: null });

    const transport = new MailTransport(
      makeConfig({ RESEND_API_KEY: 're_test' }),
    );
    await transport.send({ to: 'a@b.com', subject: 'Hi' });

    expect(mockSend).toHaveBeenCalledWith(
      expect.not.objectContaining({ replyTo: expect.anything() as unknown }),
    );
  });

  it('throws when Resend returns an error so the processor marks FAILED and BullMQ retries', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'rate limited' },
    });

    const transport = new MailTransport(
      makeConfig({ RESEND_API_KEY: 're_test' }),
    );

    await expect(
      transport.send({ to: 'a@b.com', subject: 'Hi' }),
    ).rejects.toThrow(/rate limited/);
  });
});
