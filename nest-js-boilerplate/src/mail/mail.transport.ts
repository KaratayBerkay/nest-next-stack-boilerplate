import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SentMail {
  /** Which transport handled delivery: 'resend' in prod, 'dev' when no API key is configured. */
  provider: string;
  /** Provider-side message id, when the transport returns one. */
  messageId?: string;
}

/**
 * Outbound email transport. Sends through Resend (https://resend.com) when RESEND_API_KEY is set;
 * otherwise falls back to a dev transport that just logs — so tests and local runs work offline
 * with no network calls. The queue, retries, and EmailMessage status tracking are transport-agnostic.
 */
@Injectable()
export class MailTransport {
  private readonly logger = new Logger(MailTransport.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly replyTo?: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = config.get<string>('MAIL_FROM', 'onboarding@resend.dev');
    // Optional: route replies (e.g. to a Gmail inbox) while still sending from the verified domain.
    this.replyTo = config.get<string>('MAIL_REPLY_TO') || undefined;
  }

  async send(opts: SendMailOptions): Promise<SentMail> {
    const text = opts.text ?? opts.subject;
    const html = opts.html ?? `<p>${text}</p>`;

    if (!this.resend) {
      this.logger.log(`[dev-mail] -> ${opts.to} :: ${opts.subject}`);
      return { provider: 'dev' };
    }

    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: opts.to,
      subject: opts.subject,
      html,
      text,
      ...(this.replyTo ? { replyTo: this.replyTo } : {}),
    });

    if (error) {
      // Surface as a thrown error so the processor marks the message FAILED and BullMQ retries.
      throw new Error(`Resend send failed: ${error.message}`);
    }

    return { provider: 'resend', messageId: data?.id };
  }
}
