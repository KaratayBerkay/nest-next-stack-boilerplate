import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SentMail {
  provider: string;
  messageId?: string;
}

@Injectable()
export class MailTransport {
  private readonly logger = new Logger(MailTransport.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly replyTo?: string;
  private readonly smtpTransport: nodemailer.Transporter | null;

  constructor(config: ConfigService) {
    const smtpHost = config.get<string>('SMTP_HOST');
    if (smtpHost) {
      const smtpPort = config.get<number>('SMTP_PORT', 587);
      const smtpSecure = config.get<string>('SMTP_SECURE', 'false') === 'true';
      const smtpUser = config.get<string>('SMTP_USER');
      const smtpPass = config.get<string>('SMTP_PASS');

      this.smtpTransport = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth:
          smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      } as nodemailer.TransportOptions) as nodemailer.Transporter;
    } else {
      this.smtpTransport = null;
    }

    const apiKey = config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = config.get<string>('MAIL_FROM', 'onboarding@resend.dev');
    this.replyTo = config.get<string>('MAIL_REPLY_TO') || undefined;
  }

  async send(opts: SendMailOptions): Promise<SentMail> {
    const text = opts.text ?? opts.subject;
    const html = opts.html ?? `<p>${text}</p>`;

    if (this.smtpTransport) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const info = await this.smtpTransport.sendMail({
          from: this.from,
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
      }
    }

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
      throw new Error(`Resend send failed: ${error.message}`);
    }

    return { provider: 'resend', messageId: data?.id };
  }
}
