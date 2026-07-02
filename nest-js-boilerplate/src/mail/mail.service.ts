import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { EmailMessage, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MAIL_QUEUE } from './mail.constants';

export interface QueueEmailArgs {
  to: string;
  subject: string;
  template: string;
  userId?: string | null;
  variables?: Record<string, unknown>;
}

/**
 * Persists an EmailMessage (the email "outbox") and enqueues a send job on the broker.
 * Sending never happens on the request path — a worker (MailProcessor) drains the queue.
 */
@Injectable()
export class MailService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
  ) {}

  async enqueue(args: QueueEmailArgs): Promise<EmailMessage> {
    const email = await this.prisma.emailMessage.create({
      data: {
        to: args.to,
        userId: args.userId ?? null,
        subject: args.subject,
        template: args.template,
        variables: (args.variables as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        status: 'QUEUED',
      },
    });

    await this.mailQueue.add(
      args.template,
      { emailId: email.id },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );

    return email;
  }
}
