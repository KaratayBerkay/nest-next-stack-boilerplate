import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  /** A claimed MXRoute pool account to send this one message as — takes over
   *  from the static SMTP_USER/SMTP_PASS transport below entirely when given.
   *  Callers (MailProcessor) are responsible for claiming/creating this via
   *  MxrouteAccountsService; this class only knows how to send with it. */
  from?: { email: string; password: string };
}

export interface SentMail {
  provider: string;
  messageId?: string;
}

@Injectable()
export class MailTransport {
  private readonly logger = new Logger(MailTransport.name);
  private readonly resend: Resend | null;
  private readonly defaultFrom: string;
  private readonly replyTo?: string;
  private readonly smtpHost?: string;
  private readonly smtpTransport: nodemailer.Transporter | null;

  constructor(config: ConfigService) {
    this.smtpHost = config.get<string>('SMTP_HOST');
    if (this.smtpHost) {
      const smtpUser = config.get<string>('SMTP_USER');
      const smtpPass = config.get<string>('SMTP_PASS');

      // Always implicit TLS on 465, never STARTTLS on 587: 465 encrypts from the
      // first byte, so there's no plaintext window for a STARTTLS-stripping MITM
      // to exploit. Not configurable — SMTP_PORT/SMTP_SECURE are intentionally
      // ignored here. Same rule applies to the per-send pool transport below.
      // The one exception is the literal docker-compose service name
      // `mailpit` — it only resolves inside this stack's own network, is
      // never a real external host, and only speaks plaintext SMTP on 1025.
      this.smtpTransport = nodemailer.createTransport({
        host: this.smtpHost,
        ...MailTransport.smtpConnectionOptions(this.smtpHost),
        auth:
          smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      } as nodemailer.TransportOptions) as nodemailer.Transporter;
    } else {
      this.smtpTransport = null;
    }

    const apiKey = config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    // Only reached when no pool account was claimed for a send (e.g. MXRoute
    // isn't configured in this environment) — never used as a real mailbox
    // to send from once the pool is live.
    this.defaultFrom = config.get<string>('MAIL_FROM', 'onboarding@resend.dev');
    this.replyTo = config.get<string>('MAIL_REPLY_TO') || undefined;
  }

  /** `mailpit` is this stack's own dev SMTP catcher (docker-compose service
   *  name, unresolvable outside the stack's network) — plaintext on 1025.
   *  Every other host gets the hardened 465/implicit-TLS pairing described
   *  above, unconditionally. */
  private static smtpConnectionOptions(host: string): {
    port: number;
    secure: boolean;
  } {
    return host === 'mailpit'
      ? { port: 1025, secure: false }
      : { port: 465, secure: true };
  }

  async send(opts: SendMailOptions): Promise<SentMail> {
    const text = opts.text ?? opts.subject;
    const html = opts.html ?? `<p>${text}</p>`;
    const from = opts.from?.email ?? this.defaultFrom;

    // A pool account was claimed for this specific send — build a one-off
    // transport authenticated as it instead of the static SMTP_USER above.
    const dynamicTransport =
      opts.from && this.smtpHost
        ? (nodemailer.createTransport({
            host: this.smtpHost,
            ...MailTransport.smtpConnectionOptions(this.smtpHost),
            auth: { user: opts.from.email, pass: opts.from.password },
          } as nodemailer.TransportOptions) as nodemailer.Transporter)
        : null;
    const transport = dynamicTransport ?? this.smtpTransport;

    if (transport) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const info = await transport.sendMail({
          from,
          to: opts.to,
          subject: opts.subject,
          html,
          text,
          ...(this.replyTo ? { replyTo: this.replyTo } : {}),
        });
        return {
          provider: 'smtp',
          messageId: (info as { messageId?: string }).messageId,
        };
      } catch (err) {
        throw new Error(
          `SMTP send failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      } finally {
        dynamicTransport?.close();
      }
    }

    if (!this.resend) {
      this.logger.log(`[dev-mail] -> ${opts.to} :: ${opts.subject}`);
      return { provider: 'dev' };
    }

    const { data, error } = await this.resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html,
      text,
      ...(this.replyTo ? { replyTo: this.replyTo } : {}),
    });

    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }

    return { provider: 'resend', messageId: data?.id };
  }
}
