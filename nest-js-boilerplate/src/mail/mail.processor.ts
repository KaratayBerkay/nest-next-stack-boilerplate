import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MAIL_QUEUE } from './mail.constants';
import { MailTransport } from './mail.transport';
import { renderTemplate } from './templates/render';

interface MailJob {
  emailId: string;
}

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
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
