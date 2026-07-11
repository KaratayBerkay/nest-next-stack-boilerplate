/**
 * Load test setup: creates test users, generates auth tokens, seeds Redis sessions.
 *
 * Usage:  node test/load-test/setup.mjs [USER_COUNT] [SOCKETS_PER_USER]
 * Output: test/load-test/tokens.json
 */
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import pg from 'pg';
import Redis from 'ioredis';

// ── Config ──────────────────────────────────────────────────────────────────
const USER_COUNT = Number(process.argv[2] || 500);
const SOCKETS_PER_USER = Number(process.argv[3] || 20);

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://nest:nest@localhost:5432/nest?schema=public';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET =
  process.env.JWT_SECRET ||
  'bb92587a534ae7e745b00874b0a583c7d737312ea4a5e6199d549669997f11d1';
const TOKEN_DERIVATION_SECRET =
  process.env.TOKEN_DERIVATION_SECRET ||
  '6aa02cd559916930010b44b5633f80b7ccd8fcc432d1d7ad6a135ad8f61b76e7';

const BATCH_SIZE = 50;

// ── Helpers ─────────────────────────────────────────────────────────────────
function hmacSha256(key, data) {
  return createHmac('sha256', key).update(data).digest('hex');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function dateOnly(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function deriveUserToken(userId, date) {
  const d = dateOnly(date);
  return hmacSha256(TOKEN_DERIVATION_SECRET, `user.v1:${d}:${userId}`);
}

function deriveRbacToken(userId, tier, date) {
  const d = dateOnly(date);
  return hmacSha256(TOKEN_DERIVATION_SECRET, `rbac.v1:${d}:${userId}:${tier}`);
}

/** Minimal JWT sign (HS256) — no dependency needed. */
function signJwt(payload, secret, expiresInSec = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const enc = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  const head = enc(header);
  const bef = enc(body);
  const sig = createHmac('sha256', secret).update(`${head}.${bef}`).digest('base64url');
  return `${head}.${bef}.${sig}`;
}

function buildSessionKey(accessToken, rbacToken, deviceToken, userToken) {
  const parts = [accessToken, rbacToken, deviceToken, userToken].map(sha256);
  return `sess:${parts.join(':')}`;
}

function generateUuid() {
  return randomUUID();
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(
    `Setting up load test: ${USER_COUNT} users × ${SOCKETS_PER_USER} sockets = ${USER_COUNT * SOCKETS_PER_USER} connections`,
  );

  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3 });

  try {
    // 1. Create test users
    console.log('Creating test users in PostgreSQL...');
    const userIds = [];

    for (let batch = 0; batch < USER_COUNT; batch += BATCH_SIZE) {
      const end = Math.min(batch + BATCH_SIZE, USER_COUNT);
      const values = [];
      const params = [];
      let paramIdx = 1;

      for (let i = batch; i < end; i++) {
        const id = generateUuid();
        userIds.push(id);
        const email = `loadtest-user-${i}@test.local`;
        const username = `loadtest_${i}`;
        const name = `Load Test User ${i}`;

        values.push(
          `($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, 'ACTIVE', 'USER', 'FREE', 'en', 'UTC', NOW(), NOW())`,
        );
        params.push(id, email, username, name);
        paramIdx += 4;
      }

      await pool.query(
        `INSERT INTO "User" (id, email, username, name, status, role, "subscriptionTier", locale, timezone, "createdAt", "updatedAt")
         VALUES ${values.join(', ')}
         ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE'`,
        params,
      );

      process.stdout.write(
        `\r  Users created: ${end}/${USER_COUNT}`,
      );
    }
    console.log('\n  Done.');

    // 2. Generate tokens + seed Redis
    console.log('Generating tokens and seeding Redis sessions...');
    const tokens = [];
    let seeded = 0;
    let pipe = redis.pipeline();

    for (let i = 0; i < USER_COUNT; i++) {
      const userId = userIds[i];
      const userToken = deriveUserToken(userId);
      const rbacToken = deriveRbacToken(userId, 'FREE');

      for (let s = 0; s < SOCKETS_PER_USER; s++) {
        const deviceToken = randomBytes(32).toString('base64url');
        const accessToken = signJwt({ sub: userId, email: `loadtest-user-${i}@test.local`, role: 'USER' }, JWT_SECRET);

        const key = buildSessionKey(accessToken, rbacToken, deviceToken, userToken);
        const sessionId = randomBytes(24).toString('base64url');

        // Seed Redis session (mirrors TokenStoreService.write)
        pipe.hset(key, {
          v: '2',
          userId,
          email: `loadtest-user-${i}@test.local`,
          role: 'USER',
          tier: 'FREE',
          deviceId: '',
          ip: '127.0.0.1',
          userAgent: 'k6-load-test',
          issuedAt: new Date().toISOString(),
          sessionId,
          name: `Load Test User ${i}`,
          username: `loadtest_${i}`,
          avatarUrl: '',
          locale: 'en',
          timezone: 'UTC',
          friends: '[]',
          unread: '0',
          orgIds: '[]',
          teamIds: '[]',
        });
        pipe.expire(key, 3600);
        // Reverse index
        pipe.sadd(`user:${userId}:sessions`, key);

        tokens.push({ accessToken, rbacToken, deviceToken, userToken });

        seeded++;
      }

      // Flush pipeline every BATCH_SIZE users
      if ((i + 1) % BATCH_SIZE === 0 || i === USER_COUNT - 1) {
        await pipe.exec();
        pipe = redis.pipeline();
        process.stdout.write(`\r  Sessions seeded: ${seeded}/${USER_COUNT * SOCKETS_PER_USER}`);
      }
    }

    console.log(`\r  Sessions seeded: ${seeded}/${USER_COUNT * SOCKETS_PER_USER}  Done.`);

    // 3. Write tokens file
    const outputPath = new URL('./tokens.json', import.meta.url).pathname;
    writeFileSync(outputPath, JSON.stringify(tokens, null, 0));
    console.log(`Tokens written to ${outputPath} (${tokens.length} entries)`);

    // 4. Verify
    const userCount = await pool.query(
      `SELECT COUNT(*) FROM "User" WHERE email LIKE 'loadtest-user-%@test.local'`,
    );
    const sessionCount = await redis.keys('sess:*');
    console.log(`\nVerification:`);
    console.log(`  Users in DB: ${userCount.rows[0].count}`);
    console.log(`  Sessions in Redis: ${sessionCount.length}`);
  } finally {
    await pool.end();
    await redis.quit();
  }
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
