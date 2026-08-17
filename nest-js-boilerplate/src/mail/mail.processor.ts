import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  MAIL_QUEUE,
  MAIL_SEND_LIMIT_PER_HOUR,
  MAIL_SEND_LIMIT_WINDOW_MS,
} from './mail.constants';
import { MailTransport } from './mail.transport';
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly transport: MailTransport,
  ) {
    super();
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

      const sent = await this.transport.send({
        to: email.to,
        subject: rendered?.subject ?? email.subject,
        html: rendered?.html,
        text: rendered?.text,
      });
      await this.prisma.emailMessage.update({
        where: { id: email.id },
        data: {
          status: 'SENT',
          provider: sent.provider,
          providerMessageId: sent.messageId ?? null,
          sentAt: new Date(),
        },
      });
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
