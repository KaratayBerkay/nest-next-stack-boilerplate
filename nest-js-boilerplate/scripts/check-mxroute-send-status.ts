/**
 * Prints an MXRoute mailbox's current daily send usage (sent/limit/remaining) so a
 * bulk-mail run can be sized against real headroom instead of a guessed number.
 *
 * Usage:
 *   pnpm check:mxroute-status [user] [domain]
 *   pnpm check:mxroute-status noreply berwallet.online   # defaults, same as no args
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MxrouteAccountsService } from '../src/mail/mxroute-accounts.service';

// Deliberately narrow — see backfill-r2-attachments.ts for why: this script needs
// only config + one HTTP call, not the full AppModule's DB/Redis/GraphQL/Joi-env boot.
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [MxrouteAccountsService],
})
class CheckMxrouteStatusModule {}

async function main() {
  const [user = 'noreply', domain = 'berwallet.online'] = process.argv.slice(2);

  const app = await NestFactory.createApplicationContext(
    CheckMxrouteStatusModule,
    { logger: ['error', 'warn'] },
  );
  const mxroute = app.get(MxrouteAccountsService);

  if (!mxroute.configured) {
    console.error(
      "MXROUTE_SERVER/MXROUTE_USERNAME/MXROUTE_API_KEY are not set in this process's env.",
    );
    await app.close();
    process.exitCode = 1;
    return;
  }

  const status = await mxroute.getSendStatus(domain, user);
  console.log(JSON.stringify(status, null, 2));

  if (status.suspended) {
    console.error(`Warning: ${status.email} is suspended.`);
  }
  if (status.remaining <= 0) {
    console.error(
      `Warning: ${status.email} has no send headroom left today (${status.sent}/${status.limit}).`,
    );
  }

  await app.close();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
