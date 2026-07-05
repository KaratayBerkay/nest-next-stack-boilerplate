import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { MailTransport } from './mail.transport';

// Mock the Resend SDK with a factory so the real module is never loaded and no network call is
// ever made. `mockSend` is mock-prefixed so jest allows referencing it inside the factory.
const mockSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({ emails: { send: mockSend } })),
}));

const ResendMock = Resend as unknown as jest.Mock;

// Mock nodemailer so SMTP tests never connect to a real server.
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => {
  const mockCreateTransportFn = jest.fn(() => ({
    sendMail: mockSendMail,
  }));
  return { createTransport: mockCreateTransportFn };
});

const nodemailerCreateTransport = nodemailer.createTransport as jest.Mock;

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
    mockSendMail.mockReset();
    nodemailerCreateTransport.mockClear();
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

  describe('SMTP transport', () => {
    it('sends via nodemailer when SMTP_HOST is configured', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'smtp_msg_1' });

      const transport = new MailTransport(
        makeConfig({ SMTP_HOST: 'mailpit', MAIL_FROM: 'noreply@app.dev' }),
      );
      const result = await transport.send({
        to: 'b@c.com',
        subject: 'SMTP test',
      });

      expect(nodemailerCreateTransport).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@app.dev',
          to: 'b@c.com',
          subject: 'SMTP test',
        }),
      );
      expect(result).toEqual({ provider: 'smtp', messageId: 'smtp_msg_1' });
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('forwards MAIL_REPLY_TO as replyTo via SMTP', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'smtp_msg_2' });

      const transport = new MailTransport(
        makeConfig({
          SMTP_HOST: 'mailpit',
          MAIL_REPLY_TO: 'support@app.dev',
        }),
      );
      await transport.send({ to: 'b@c.com', subject: 'Test' });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ replyTo: 'support@app.dev' }),
      );
    });

    it('omits replyTo via SMTP when MAIL_REPLY_TO is not set', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'smtp_msg_3' });

      const transport = new MailTransport(makeConfig({ SMTP_HOST: 'mailpit' }));
      await transport.send({ to: 'b@c.com', subject: 'Test' });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.not.objectContaining({ replyTo: expect.anything() as unknown }),
      );
    });

    it('always connects on port 465 with implicit TLS, regardless of SMTP_PORT/SMTP_SECURE', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'smtp_msg_4' });

      // SMTP_PORT/SMTP_SECURE are deliberately wrong here (the 587+STARTTLS pairing) to
      // prove they're ignored: 465/implicit-TLS avoids the STARTTLS-stripping window
      // that 587 has, so it's hardcoded rather than left operator-configurable.
      const transport = new MailTransport(
        makeConfig({
          SMTP_HOST: 'smtp.sendgrid.net',
          SMTP_PORT: '587',
          SMTP_SECURE: 'false',
          SMTP_USER: 'apikey',
          SMTP_PASS: 'SG_secret',
        }),
      );
      await transport.send({ to: 'b@c.com', subject: 'Test' });

      expect(nodemailerCreateTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.sendgrid.net',
          port: 465,
          secure: true,
          auth: { user: 'apikey', pass: 'SG_secret' },
        }),
      );
    });

    it('throws when SMTP sendMail fails', async () => {
      mockSendMail.mockRejectedValue(new Error('connection refused'));

      const transport = new MailTransport(makeConfig({ SMTP_HOST: 'mailpit' }));

      await expect(
        transport.send({ to: 'b@c.com', subject: 'Fail' }),
      ).rejects.toThrow(/SMTP send failed: connection refused/);
    });

    it('falls back to dev transport when neither SMTP_HOST nor RESEND_API_KEY is set', async () => {
      const transport = new MailTransport(makeConfig({}));

      const result = await transport.send({
        to: 'a@b.com',
        subject: 'Fallback',
      });

      expect(result).toEqual({ provider: 'dev' });
      expect(nodemailerCreateTransport).not.toHaveBeenCalled();
      expect(ResendMock).not.toHaveBeenCalled();
    });
  });
});
