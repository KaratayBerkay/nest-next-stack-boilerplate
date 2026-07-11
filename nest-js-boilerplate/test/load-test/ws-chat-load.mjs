/**
 * Node.js WebSocket load test — 5K connections x 10 chat messages.
 *
 * Prerequisites:  node test/load-test/setup.mjs 5000 1  (creates tokens.json)
 * Run:            node test/load-test/ws-chat-load.mjs
 *
 * Env vars:
 *   WS_URL        - WebSocket endpoint (default: ws://localhost:3000/ws)
 *   CHAT_ROOM     - Room to join (default: general)
 *   MSG_COUNT     - Messages per connection (default: 10)
 *   BATCH_SIZE    - Connections to open per batch (default: 100)
 *   BATCH_DELAY   - Delay between batches in ms (default: 200)
 */
import { readFileSync } from 'node:fs';
import { WebSocket } from 'ws';

// ── Config ──────────────────────────────────────────────────────────────────
const WS_URL = process.env.WS_URL || 'ws://localhost:3000/ws';
const ROOM = process.env.CHAT_ROOM || 'general';
const MSG_COUNT = Number(process.env.MSG_COUNT || 10);
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 50);
const BATCH_DELAY = Number(process.env.BATCH_DELAY || 100);

const tokens = JSON.parse(readFileSync(new URL('./tokens.json', import.meta.url), 'utf8'));
const TOTAL = tokens.length;

console.log(`Load test: ${TOTAL} connections x ${MSG_COUNT} messages = ${TOTAL * MSG_COUNT} total`);
console.log(`Room: ${ROOM} | Batch: ${BATCH_SIZE} | Delay: ${BATCH_DELAY}ms`);

// ── Metrics ─────────────────────────────────────────────────────────────────
let connected = 0;
let authed = 0;
let joined = 0;
let msgsSent = 0;
let msgsRecv = 0;
let errors = 0;
let done = 0;

const authLatencies = [];
const joinLatencies = [];
const msgLatencies = [];
const startTime = Date.now();

// ── Connection logic ────────────────────────────────────────────────────────
function connect(index) {
  return new Promise((resolve) => {
    const token = tokens[index];
    const state = { phase: 'connecting', authSentAt: 0, joinSentAt: 0, msgSentAt: 0, msgIndex: 0, myEchoCount: 0, sentAll: false };

    const ws = new WebSocket(WS_URL);

    ws.on('error', () => {
      errors++;
      resolve();
    });

    ws.on('open', () => {
      connected++;
      state.phase = 'auth';
      state.authSentAt = Date.now();
      ws.send(JSON.stringify({
        type: 'auth',
        tokens: {
          accessToken: token.accessToken,
          rbacToken: token.rbacToken,
          deviceToken: token.deviceToken,
          userToken: token.userToken,
        },
      }));
    });

    ws.on('message', (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (state.phase === 'auth' && data.type === 'authenticated') {
        const latency = Date.now() - state.authSentAt;
        authLatencies.push(latency);
        authed++;
        state.phase = 'join';
        state.joinSentAt = Date.now();
        ws.send(JSON.stringify({ type: 'join-room', room: ROOM }));
      } else if (state.phase === 'join' && data.type === 'user-joined') {
        const latency = Date.now() - state.joinSentAt;
        joinLatencies.push(latency);
        joined++;
        state.phase = 'send';
        state.msgSentAt = Date.now();
        // Send all messages immediately
        for (let i = 0; i < MSG_COUNT; i++) {
          ws.send(JSON.stringify({
            type: 'room-message',
            room: ROOM,
            text: `Load test message ${i + 1}/${MSG_COUNT} from user ${index}`,
            tempId: `temp-${index}-${i}`,
          }));
          msgsSent++;
        }
      } else if (state.phase === 'send' && data.type === 'room-message') {
        // Only count our own echoes (matched by tempId)
        if (data.tempId && data.tempId.startsWith(`temp-${index}-`)) {
          state.myEchoCount++;
          if (state.myEchoCount === 1) {
            msgLatencies.push(Date.now() - state.msgSentAt);
          }
          if (state.myEchoCount >= MSG_COUNT) {
            state.phase = 'done';
            done++;
            ws.close();
            resolve();
          }
        }
      }
    });

    ws.on('close', () => {
      if (state.phase !== 'done') {
        errors++;
        resolve();
      }
    });

    // Timeout after 15s
    setTimeout(() => {
      if (state.phase !== 'done' && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }, 15000);
  });
}

// ── Run in batches ──────────────────────────────────────────────────────────
async function run() {
  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL); j++) {
      batch.push(connect(j));
    }
    await Promise.all(batch);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(
      `\r  [${elapsed}s] Connected: ${connected} | Authed: ${authed} | Joined: ${joined} | Sent: ${msgsSent} | Done: ${done}/${TOTAL} | Errors: ${errors}`,
    );
    if (i + BATCH_SIZE < TOTAL) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY));
    }
  }

  // Wait a bit for remaining echoes
  await new Promise((r) => setTimeout(r, 2000));

  printReport();
}

function pct(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function printReport() {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalMsgs = TOTAL * MSG_COUNT;

  console.log('\n');
  console.log('========================================');
  console.log('   WebSocket Load Test Report');
  console.log('========================================');
  console.log(`  Duration:      ${elapsed}s`);
  console.log(`  Target:        ${TOTAL} connections x ${MSG_COUNT} messages = ${totalMsgs} total`);
  console.log(`  Room:          ${ROOM}`);
  console.log('----------------------------------------');
  console.log(`  Connected:     ${connected}`);
  console.log(`  Authenticated: ${authed}`);
  console.log(`  Joined Room:   ${joined}`);
  console.log(`  Messages Sent: ${msgsSent}`);
  console.log(`  Msg Echoes:    ${msgsRecv}`);
  console.log(`  Errors:        ${errors}`);
  console.log(`  Success Rate:  ${((done / TOTAL) * 100).toFixed(2)}%`);
  console.log('----------------------------------------');
  console.log(`  Auth P50:      ${pct(authLatencies, 50)}ms`);
  console.log(`  Auth P95:      ${pct(authLatencies, 95)}ms`);
  console.log(`  Auth P99:      ${pct(authLatencies, 99)}ms`);
  console.log(`  Join P50:      ${pct(joinLatencies, 50)}ms`);
  console.log(`  Join P95:      ${pct(joinLatencies, 95)}ms`);
  console.log(`  Join P99:      ${pct(joinLatencies, 99)}ms`);
  console.log(`  Msg P50:       ${pct(msgLatencies, 50)}ms`);
  console.log(`  Msg P95:       ${pct(msgLatencies, 95)}ms`);
  console.log(`  Msg P99:       ${pct(msgLatencies, 99)}ms`);
  console.log('========================================');
}

run().catch(console.error);
