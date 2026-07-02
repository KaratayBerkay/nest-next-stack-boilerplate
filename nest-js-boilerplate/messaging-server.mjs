import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const paths = [
    resolve(__dirname, "../nest-js-boilerplate/.env"),
    resolve(__dirname, ".env.local"),
    resolve(__dirname, ".env"),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      for (const line of readFileSync(p, "utf-8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq);
        const val = trimmed.slice(eq + 1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

const JWT_SECRET = process.env.JWT_SECRET || "change-me-dev-only-jwt-secret";
const DERIVATION_SECRET = process.env.TOKEN_DERIVATION_SECRET || JWT_SECRET;
const DB_URL = process.env.DATABASE_URL || "postgresql://nest:nest@localhost:5432/nest?schema=public";
const PORT = parseInt(process.env.MSG_PORT || "3003", 10);
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import Redis from "ioredis";

const redis = new Redis(REDIS_PORT, REDIS_HOST, { maxRetriesPerRequest: 3, lazyConnect: true });
await redis.connect().catch(() => {});

let pg;
try {
  pg = (await import("pg")).default;
} catch {
  pg = (await import("pg")).default;
}

function parseDbUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || "5432", 10),
    database: u.pathname.slice(1).split("?")[0],
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
  };
}

const dbConfig = parseDbUrl(DB_URL);
import pgModule from "pg";
const { Pool: PgPool } = pgModule;

const pool = new PgPool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  max: 5,
  idleTimeoutMillis: 30000,
});

// --- Token derivation (mirrors nest-js-boilerplate CryptoService) ---

function hmacSha256(secret, data) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

function dateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function deriveRbacToken(rbacToken) {
  return `rbac.v1:${hmacSha256(DERIVATION_SECRET, `rbac:${dateOnly()}:${rbacToken}`)}`;
}

function deriveUserToken(userToken) {
  return `user.v1:${hmacSha256(DERIVATION_SECRET, `user:${dateOnly()}:${userToken}`)}`;
}

function buildCompoundKey(accessToken, rbacToken, deviceToken, userToken) {
  const parts = [
    hmacSha256(JWT_SECRET, accessToken),
    deriveRbacToken(rbacToken),
    hmacSha256(DERIVATION_SECRET, deviceToken),
    deriveUserToken(userToken),
  ];
  return `sess:${parts.join(":")}`;
}

// --- Auth ---

function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/** Verify all four tokens against the Redis compound key. Returns the Redis hash or null. */
async function verifyTokens(tokens) {
  if (!tokens?.accessToken || !tokens?.rbacToken || !tokens?.deviceToken || !tokens?.userToken) return null;
  const key = buildCompoundKey(
    tokens.accessToken,
    tokens.rbacToken,
    tokens.deviceToken,
    tokens.userToken,
  );
  try {
    const hash = await redis.hgetall(key);
    if (!hash || !hash.userId) return null;
    return hash;
  } catch {
    return null;
  }
}

async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

// --- HTTP Router ---
const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.writeHead(204).end();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  async function json(data, status = 200) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }

  function unauthorized() {
    json({ error: "Unauthorized" }, 401);
  }

  async function handle() {
    // HTTP auth: accept JWT Bearer or all 4 tokens as headers
    const authHeader = req.headers.authorization;
    let payload;
    if (authHeader?.startsWith("Bearer ")) {
      payload = verifyJwt(authHeader.slice(7));
    }
    if (!payload) {
      const tokens = {
        accessToken: req.headers["x-access-token"],
        rbacToken: req.headers["x-rbac-token"],
        deviceToken: req.headers["x-device-token"],
        userToken: req.headers["x-user-token"],
      };
      const hash = await verifyTokens(tokens);
      if (!hash) return unauthorized();
      payload = { sub: hash.userId };
    }
    if (!payload) return unauthorized();

    // GET /api/users
    if (method === "GET" && path === "/api/users") {
      const search = url.searchParams.get("q") || "";
      const rows = await query(
        `SELECT id, email, name, username FROM "User"
         WHERE (name ILIKE $1 OR email ILIKE $1) AND status = 'ACTIVE'
         ORDER BY name ASC LIMIT 50`,
        [`%${search}%`],
      );
      return json(rows.map(formatUser));
    }

    // GET /api/conversations
    if (method === "GET" && path === "/api/conversations") {
      const rows = await query(
        `SELECT DISTINCT ON (other.id)
           other.id, other.email, other.name,
           m.body AS last_body, m."createdAt" AS last_time,
           (SELECT COUNT(*)::int FROM "Message"
            WHERE "recipientId" = $1 AND "senderId" = other.id AND "readAt" IS NULL) AS unread
         FROM "Message" m
         JOIN "User" other ON other.id = CASE WHEN m."senderId" = $1 THEN m."recipientId" ELSE m."senderId" END
         WHERE $1 IN (m."senderId", m."recipientId")
         ORDER BY other.id, m."createdAt" DESC`,
        [payload.sub],
      );
      return json(rows.map((r) => ({
        user: { id: r.id, email: r.email, name: r.name },
        lastMessage: r.last_body,
        lastTime: r.last_time,
        unread: r.unread,
      })));
    }

    // GET /api/conversations/:userId/messages
    const msgMatch = path.match(/^\/api\/conversations\/([a-f0-9-]+)\/messages$/);
    if (method === "GET" && msgMatch) {
      const otherId = msgMatch[1];
      const rows = await query(
        `SELECT id, "senderId", "recipientId", body, "createdAt"
         FROM "Message"
         WHERE ("senderId" = $1 AND "recipientId" = $2) OR ("senderId" = $2 AND "recipientId" = $1)
         ORDER BY "createdAt" ASC LIMIT 100`,
        [payload.sub, otherId],
      );
      return json(rows.map(formatMessage));
    }

    // POST /api/conversations/:userId/messages
    if (method === "POST" && msgMatch) {
      const otherId = msgMatch[1];
      let body = "";
      for await (const chunk of req) body += chunk;
      const { text } = JSON.parse(body);
      if (!text?.trim()) return json({ error: "Text is required" }, 400);

      // Friends-only DM enforcement
      const friends = await query(
        `SELECT 1 FROM "FriendRequest"
         WHERE status = 'ACCEPTED'
           AND ((requesterId = $1 AND addresseeId = $2) OR (requesterId = $2 AND addresseeId = $1))`,
        [payload.sub, otherId],
      );
      if (friends.length === 0) return json({ error: "Not friends" }, 403);

      const [row] = await query(
        `INSERT INTO "Message" (id, "senderId", "recipientId", body, "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         RETURNING id, "senderId", "recipientId", body, "createdAt"`,
        [payload.sub, otherId, text.trim()],
      );
      const msg = formatMessage(row);

      const recipientWs = userConnections.get(otherId);
      if (recipientWs?.readyState === 1) {
        sendWs(recipientWs, { type: "direct-message", message: msg });
      }

      return json(msg, 201);
    }

    json({ error: "Not found" }, 404);
  }

  handle().catch((err) => {
    console.error("HTTP error:", err);
    json({ error: "Internal error" }, 500);
  });
});

// --- WebSocket ---
const wss = new WebSocketServer({ server });

const userConnections = new Map();
const chatRooms = new Map();

function sendWs(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function roomKey(name) {
  return `room:${name}`;
}

wss.on("connection", (ws, req) => {
  let authenticated = false;
  let authTimer = setTimeout(() => {
    if (!authenticated) {
      sendWs(ws, { type: "error", message: "Auth timeout" });
      ws.close(4001, "Auth timeout");
    }
  }, 120_000);

  ws.userId = null;
  ws.userName = null;
  ws.rooms = new Set();

  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return sendWs(ws, { type: "error", message: "Invalid JSON" });
    }

    // --- Auth via first message ---
    if (!authenticated) {
      if (data.type === "auth" && data.tokens) {
        const hash = await verifyTokens(data.tokens);
        if (!hash) {
          // Fallback: single JWT token
          const payload = data.token ? verifyJwt(data.token) : null;
          if (!payload) {
            return sendWs(ws, { type: "error", message: "Auth failed" });
          }
          ws.userId = payload.sub;
          ws.userName = payload.name || payload.email || "User";
        } else {
          ws.userId = hash.userId;
          ws.userName = hash.name || hash.email || "User";
        }
        authenticated = true;
        clearTimeout(authTimer);
        authTimer = null;
        userConnections.set(ws.userId, ws);
        sendWs(ws, { type: "authenticated" });
        return;
      }
      // Legacy single-token fallback
      if (data.type === "auth" && data.token) {
        const payload = verifyJwt(data.token);
        if (!payload) {
          return sendWs(ws, { type: "error", message: "Auth failed" });
        }
        ws.userId = payload.sub;
        ws.userName = payload.name || payload.email || "User";
        authenticated = true;
        clearTimeout(authTimer);
        authTimer = null;
        userConnections.set(ws.userId, ws);
        sendWs(ws, { type: "authenticated" });
        return;
      }
      sendWs(ws, { type: "error", message: "Authenticate first" });
      ws.close(4001);
      return;
    }

    const userId = ws.userId;

    switch (data.type) {
      case "direct-message": {
        const { recipientId, text } = data;
        if (!recipientId || !text?.trim()) break;

        // Friends-only DM enforcement
        const friends = await query(
          `SELECT 1 FROM "FriendRequest"
           WHERE status = 'ACCEPTED'
             AND ((requesterId = $1 AND addresseeId = $2) OR (requesterId = $2 AND addresseeId = $1))`,
          [userId, recipientId],
        );
        if (friends.length === 0) {
          return sendWs(ws, { type: "error", message: "Not friends" });
        }

        const [row] = await query(
          `INSERT INTO "Message" (id, "senderId", "recipientId", body, "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())
           RETURNING id, "senderId", "recipientId", body, "createdAt"`,
          [userId, recipientId, text.trim()],
        );
        const msg = formatMessage(row);
        sendWs(ws, { type: "direct-message", message: msg });
        const rcp = userConnections.get(recipientId);
        if (rcp && rcp !== ws && rcp.readyState === 1) {
          sendWs(rcp, { type: "direct-message", message: msg });
        }
        break;
      }

      case "join-room": {
        const room = data.room;
        if (!room) break;
        ws.rooms.add(room);
        if (!chatRooms.has(room)) chatRooms.set(room, new Set());
        chatRooms.get(room).add(userId);
        const avatar = getInitials(ws.userName);
        broadcastToRoom(room, {
          type: "user-joined",
          room,
          user: { id: userId, name: ws.userName, avatar },
          members: [...chatRooms.get(room)].map((uid) => {
            const c = userConnections.get(uid);
            return { id: uid, name: c?.userName || "unknown", avatar: getInitials(c?.userName || "?") };
          }),
        }, ws);
        break;
      }

      case "leave-room": {
        const room = data.room;
        if (!room) break;
        ws.rooms.delete(room);
        chatRooms.get(room)?.delete(userId);
        if (chatRooms.get(room)?.size === 0) chatRooms.delete(room);
        broadcastToRoom(room, {
          type: "user-left",
          room,
          user: { id: userId, name: ws.userName, avatar: getInitials(ws.userName) },
          members: [...(chatRooms.get(room) || [])].map((uid) => {
            const c = userConnections.get(uid);
            return { id: uid, name: c?.userName || "unknown", avatar: getInitials(c?.userName || "?") };
          }),
        });
        break;
      }

      case "room-message": {
        const room = data.room;
        const text = data.text;
        if (!room || !text?.trim()) break;
        broadcastToRoom(room, {
          type: "room-message",
          room,
          message: {
            senderId: userId,
            senderName: ws.userName,
            avatar: getInitials(ws.userName),
            body: text.trim(),
            createdAt: new Date().toISOString(),
          },
        });
        break;
      }

      default:
        sendWs(ws, { type: "error", message: `Unknown type: ${data.type}` });
    }
  });

  ws.on("close", () => {
    if (ws.userId && userConnections.get(ws.userId) === ws) {
      userConnections.delete(ws.userId);
    }
    for (const room of ws.rooms) {
      chatRooms.get(room)?.delete(ws.userId);
      if (chatRooms.get(room)?.size === 0) chatRooms.delete(room);
      broadcastToRoom(room, {
        type: "user-left",
        room,
        user: { id: ws.userId, name: ws.userName, avatar: getInitials(ws.userName) },
        members: [...(chatRooms.get(room) || [])].map((uid) => {
          const c = userConnections.get(uid);
          return { id: uid, name: c?.userName || "unknown", avatar: getInitials(c?.userName || "?") };
        }),
      });
    }
  });
});

function broadcastToRoom(room, data, excludeWs) {
  const memberIds = chatRooms.get(room);
  if (!memberIds) return;
  for (const uid of memberIds) {
    const ws = userConnections.get(uid);
    if (ws && ws !== excludeWs && ws.readyState === 1) {
      sendWs(ws, data);
    }
  }
  if (excludeWs && excludeWs.readyState === 1) {
    sendWs(excludeWs, data);
  }
}

function formatUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name || row.username || row.email,
    avatar: getInitials(row.name || row.username || row.email),
  };
}

function formatMessage(row) {
  return {
    id: row.id,
    senderId: row.senderId,
    recipientId: row.recipientId,
    body: row.body,
    createdAt: row.createdAt,
  };
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

server.listen(PORT, () => {
  console.log(`Messaging server (Phase 3) running on :${PORT}`);
  console.log(`  HTTP API: http://localhost:${PORT}/api/`);
  console.log(`  WS:       ws://localhost:${PORT} (auth via first message)`);
  console.log(`  Redis:    ${REDIS_HOST}:${REDIS_PORT}`);
});
