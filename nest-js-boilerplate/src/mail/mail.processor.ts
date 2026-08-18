import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  MAIL_QUEUE,
  MAIL_SEND_LIMIT_PER_HOUR,
  MAIL_SEND_LIMIT_WINDOW_MS,
  resolveMailDomain,
} from './mail.constants';
import { MailTransport } from './mail.transport';
import { MxrouteAccountsService } from './mxroute-accounts.service';
import { renderTemplate } from './templates/render';

interface MailJob {
  emailId: string;
}

// The rate limiter is a Worker concern in BullMQ 5 (throttles processing/consumption),
// not a Queue concern — registerQueue's options don't have a `limiter` field.
@Processor(MAIL_QUEUE, {
  limiter: {
    max: MAIL_SEND_LIMIT_PER_HOUR,
    duration: MAIL_SEND_LIMIT_WINDOW_MS,
  },
})
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private readonly mailDomain: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly transport: MailTransport,
    private readonly mxrouteAccounts: MxrouteAccountsService,
    config: ConfigService,
  ) {
    super();
    this.mailDomain = resolveMailDomain(config);
  }

  /** Claims an existing pool account with headroom, provisioning a fresh one
   *  only when nothing is claimable — see claimAvailableAccount()'s own doc
   *  for why that order matters. Returns null (not an error) when MXRoute
   *  isn't configured in this environment at all, so send() falls back to
   *  its static SMTP_USER/Resend/dev-log chain unchanged. */
  private async resolveSendAccount(): Promise<{
    email: string;
    password: string;
  } | null> {
    if (!this.mxrouteAccounts.configured) return null;
    const account =
      (await this.mxrouteAccounts.claimAvailableAccount()) ??
      (await this.mxrouteAccounts.createAccount(this.mailDomain));
    const password = await this.mxrouteAccounts.getDecryptedPassword(
      account.email,
    );
    return { email: account.email, password };
  }

  async process(job: Job<MailJob>): Promise<void> {
    const email = await this.prisma.emailMessage.findUnique({
      where: { id: job.data.emailId },
    });
    if (!email) return;

    await this.prisma.emailMessage.update({
      where: { id: email.id },
      data: { status: 'SENDING', attempts: { increment: 1 } },
    });

    try {
      const rendered = email.template
        ? renderTemplate(
            email.template,
            (email.variables as Record<string, unknown>) ?? {},
          )
        : null;

      const account = await this.resolveSendAccount();
      const sent = await this.transport.send({
        to: email.to,
        subject: rendered?.subject ?? email.subject,
        html: rendered?.html,
        text: rendered?.text,
        from: account ?? undefined,
      });

      const markSent = this.prisma.emailMessage.update({
        where: { id: email.id },
        data: {
          status: 'SENT',
          provider: sent.provider,
          providerMessageId: sent.messageId ?? null,
          sentAt: new Date(),
        },
      });
      // Folded into one transaction with the ledger bump so a crash between
      // the two can't leave the account's usage under- or over-counted
      // relative to what EmailMessage says actually went out.
      if (account) {
        await this.prisma.$transaction([
          markSent,
          this.mxrouteAccounts.recordSend(account.email),
        ]);
      } else {
        await markSent;
      }
    } catch (err) {
      this.logger.error(
        {
          category: 'mail',
          event: 'mail.send_failed',
          emailId: email.id,
          attempts: email.attempts + 1,
          err: err instanceof Error ? err.message : String(err),
        },
        'Email send failed',
      );
      await this.prisma.emailMessage.update({
        where: { id: email.id },
        data: {
          status: 'FAILED',
          lastError: err instanceof Error ? err.message : String(err),
        },
      });
      throw err;
    }
  }
}
