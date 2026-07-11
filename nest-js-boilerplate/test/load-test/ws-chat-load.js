/**
 * k6 WebSocket load test — 10K connections x 10 chat messages.
 *
 * Prerequisites:  node test/load-test/setup.mjs  (creates tokens.json)
 * Run:            k6 run test/load-test/ws-chat-load.js
 *
 * Env vars:
 *   WS_URL          - WebSocket endpoint (default: ws://localhost:3000/ws)
 *   CHAT_ROOM       - Room to join (default: general)
 *   MSG_COUNT       - Messages per VU (default: 10)
 *   RAMP_UP_VUS     - VUs to use (default: from tokens.json)
 */
import ws from 'k6/ws';
import { Counter, Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// ── Metrics ─────────────────────────────────────────────────────────────────
const authDuration = new Trend('ws_auth_duration', true);
const joinDuration = new Trend('ws_join_duration', true);
const msgDuration = new Trend('ws_message_duration', true);
const authed = new Counter('ws_authed');
const joined = new Counter('ws_joined');
const msgsSent = new Counter('ws_messages_sent');
const msgsRecv = new Counter('ws_messages_received');
const errors = new Counter('ws_errors');
const successRate = new Rate('ws_success');

// ── Config ──────────────────────────────────────────────────────────────────
const TOKENS = new SharedArray('tokens', function () {
  // eslint-disable-next-line no-undef
  const data = open('./tokens.json');
  return JSON.parse(data);
});

const WS_URL = __ENV.WS_URL || 'ws://localhost:3000/ws';
const ROOM = __ENV.CHAT_ROOM || 'general';
const MSG_COUNT = Number(__ENV.MSG_COUNT || 10);
const VU_COUNT = Number(__ENV.RAMP_UP_VUS) || TOKENS.length;

export const options = {
  scenarios: {
    websocket_load: {
      executor: 'constant-vus',
      vus: VU_COUNT,
      duration: '5m',
    },
  },
  thresholds: {
    ws_auth_duration: ['p(95)<500', 'p(99)<1000'],
    ws_message_duration: ['p(95)<1000', 'p(99)<2000'],
    ws_success: ['rate>0.99'],
  },
};

// ── VU Logic ────────────────────────────────────────────────────────────────
export default function () {
  const idx = (__VU - 1) % TOKENS.length;
  const token = TOKENS[idx];
  if (!token) {
    errors.add(1);
    successRate.add(false);
    return;
  }

  // State: 0=connecting, 1=waiting-auth, 2=waiting-join, 3=sending, 4=done
  let state = 0;
  let authSentAt = 0;
  let joinSentAt = 0;
  let firstMsgSentAt = 0;
  let msgIndex = 0;
  let echoCount = 0;

  const socket = ws.connect(WS_URL, {}, function (socket) {
    socket.on('open', function () {
      state = 1;
      authSentAt = Date.now();
      socket.send(
        JSON.stringify({
          type: 'auth',
          tokens: {
            accessToken: token.accessToken,
            rbacToken: token.rbacToken,
            deviceToken: token.deviceToken,
            userToken: token.userToken,
          },
        }),
      );
    });

    socket.on('message', function (raw) {
      var data;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }

      if (state === 1 && data.type === 'authenticated') {
        authDuration.add(Date.now() - authSentAt);
        authed.add(1);

        state = 2;
        joinSentAt = Date.now();
        socket.send(JSON.stringify({ type: 'join-room', room: ROOM }));
      } else if (state === 2 && data.type === 'user-joined') {
        joinDuration.add(Date.now() - joinSentAt);
        joined.add(1);

        state = 3;
        firstMsgSentAt = Date.now();
        // Send all messages immediately — server handles ordering
        for (var i = 0; i < MSG_COUNT; i++) {
          socket.send(
            JSON.stringify({
              type: 'room-message',
              room: ROOM,
              text: 'VU' + __VU + ' msg ' + (i + 1) + '/' + MSG_COUNT,
              tempId: 't' + __VU + '-' + i,
            }),
          );
          msgsSent.add(1);
        }
        msgIndex = MSG_COUNT;
      } else if (state === 3 && data.type === 'room-message') {
        // Count echoes
        echoCount++;
        if (echoCount === 1) {
          msgDuration.add(Date.now() - firstMsgSentAt);
        }
        if (echoCount >= MSG_COUNT) {
          state = 4;
          successRate.add(true);
          socket.close();
        }
      }
    });

    socket.on('error', function () {
      errors.add(1);
      successRate.add(false);
    });
  });

  // If the iteration ended without completing, count as error
  if (state !== 4) {
    errors.add(1);
    successRate.add(false);
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────
export function handleSummary(data) {
  var m = data.metrics;
  var getCount = function (name) {
    return m[name] && m[name].values ? m[name].values.count || 0 : 0;
  };
  var getRate = function (name) {
    return m[name] && m[name].values ? m[name].values.rate || 0 : 0;
  };
  var getPct = function (name, pct) {
    if (!m[name] || !m[name].values) return 0;
    return m[name].values['p(' + pct + ')'] || 0;
  };

  var auth = getCount('ws_authed');
  var join = getCount('ws_joined');
  var sent = getCount('ws_messages_sent');
  var recv = getCount('ws_messages_received');
  var err = getCount('ws_errors');
  var rate = getRate('ws_success');
  var authP95 = getPct('ws_auth_duration', '95');
  var authP99 = getPct('ws_auth_duration', '99');
  var msgP95 = getPct('ws_message_duration', '95');
  var msgP99 = getPct('ws_message_duration', '99');

  var lines = [
    '',
    '========================================',
    '   WebSocket Load Test Report',
    '========================================',
    '  Target:        ' + VU_COUNT + ' connections x ' + MSG_COUNT + ' messages = ' + (VU_COUNT * MSG_COUNT) + ' total',
    '  Room:          ' + ROOM,
    '----------------------------------------',
    '  Authenticated: ' + auth,
    '  Joined Room:   ' + join,
    '  Messages Sent: ' + sent,
    '  Msg Echoes:    ' + recv,
    '  Errors:        ' + err,
    '  Success Rate:  ' + (rate * 100).toFixed(2) + '%',
    '----------------------------------------',
    '  Auth P95:      ' + authP95.toFixed(0) + 'ms',
    '  Auth P99:      ' + authP99.toFixed(0) + 'ms',
    '  Message P95:   ' + msgP95.toFixed(0) + 'ms',
    '  Message P99:   ' + msgP99.toFixed(0) + 'ms',
    '========================================',
    '',
  ];

  var reportPath = './test/load-test/report.json';
  var reportData = JSON.stringify({
    timestamp: new Date().toISOString(),
    vuCount: VU_COUNT,
    room: ROOM,
    messagesPerVU: MSG_COUNT,
    results: { authenticated: auth, joined: join, messagesSent: sent, echoes: recv, errors: err, successRate: rate },
    latency: { authP95: authP95, authP99: authP99, msgP95: msgP95, msgP99: msgP99 },
  }, null, 2);

  return {
    stdout: lines.join('\n'),
    // eslint-disable-next-line no-undef
    [reportPath]: reportData,
  };
}
