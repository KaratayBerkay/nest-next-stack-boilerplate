import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MAIL_QUEUE } from './mail.constants';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';
import { MailTransport } from './mail.transport';
import { MxrouteAccountsService } from './mxroute-accounts.service';

@Module({
  imports: [BullModule.registerQueue({ name: MAIL_QUEUE })],
  providers: [
    MailService,
    MailProcessor,
    MailTransport,
    MxrouteAccountsService,
  ],
  exports: [MailService, MxrouteAccountsService],
})
export class MailModule {}
