/**
 * One-off, resumable backfill: re-uploads every PendingUpload row's
 * Postgres-held ciphertext (`ct`) back into R2 under its `objectName`,
 * skipping objects that already exist there.
 *
 * Context: attachments/thumbnails used to be readable straight from
 * Postgres, so R2 was write-only and its contents could silently drift
 * from what's actually needed to serve requests (e.g. an emptied bucket).
 * This script re-establishes R2 as a complete copy before GET /upload/serve
 * is switched to read from R2 instead of Postgres — run it, confirm
 * `failed: 0, missingCiphertext: 0` in the summary, THEN ship that switch.
 *
 * Usage:
 *   pnpm backfill:r2-attachments [--dry-run]
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { S3BucketService } from '../src/upload/s3-bucket.service';

// Deliberately narrow: AppModule wires up Redis-backed BullMQ/Throttler, the
// full GraphQL schema, Stripe/Vault/Mail, and a Joi env schema requiring
// JWT_SECRET/CSRF_SECRET/etc — none of which this script needs, and each an
// extra way for a one-off maintenance script to fail to boot.
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  providers: [S3BucketService],
})
class BackfillModule {}

const BATCH_SIZE = 200;

interface Summary {
  dryRun: boolean;
  total: number;
  alreadyPresent: number;
  backfilled: number;
  failed: number;
  missingCiphertext: number;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const app = await NestFactory.createApplicationContext(BackfillModule, {
    logger: ['error', 'warn'],
  });
  const prisma = app.get(PrismaService);
  const s3 = app.get(S3BucketService);

  const summary: Summary = {
    dryRun,
    total: 0,
    alreadyPresent: 0,
    backfilled: 0,
    failed: 0,
    missingCiphertext: 0,
  };
  const failures: string[] = [];

  try {
    let cursor: string | undefined;
    for (;;) {
      const rows = await prisma.pendingUpload.findMany({
        take: BATCH_SIZE,
        ...(cursor ? { cursor: { objectName: cursor }, skip: 1 } : {}),
        orderBy: { objectName: 'asc' },
        select: { objectName: true, ct: true, size: true },
      });
      if (rows.length === 0) break;

      for (const row of rows) {
        summary.total++;
        try {
          if (await s3.exists(row.objectName)) {
            summary.alreadyPresent++;
            continue;
          }
          if (!row.ct) {
            // No R2 object AND no Postgres ciphertext — distinct from a
            // retryable failure below: this file's bytes are permanently
            // gone, re-running the script won't fix it.
            summary.missingCiphertext++;
            failures.push(
              `${row.objectName}: unrecoverable — no R2 object, no ct`,
            );
            continue;
          }
          if (!dryRun) {
            await s3.upload(
              row.objectName,
              Buffer.from(row.ct, 'base64'),
              row.size || undefined,
              'application/octet-stream',
            );
          }
          summary.backfilled++;
        } catch (err) {
          summary.failed++;
          failures.push(`${row.objectName}: ${String(err)}`);
        }
      }
      cursor = rows[rows.length - 1].objectName;
    }
  } finally {
    await app.close();
  }

  console.log(JSON.stringify(summary, null, 2));
  if (failures.length > 0) {
    console.error('\nFailures:\n' + failures.join('\n'));
  }
  if (summary.failed > 0 || summary.missingCiphertext > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
