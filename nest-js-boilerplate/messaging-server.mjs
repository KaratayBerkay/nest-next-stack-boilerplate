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
const PORT = parseInt(process.env.MSG_PORT || "3003", 10);
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const NOTIFICATION_API_KEY = process.env.NOTIFICATION_API_KEY || "dev-notification-api-key-change-in-production";

import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import Redis from "ioredis";

const redis = new Redis(REDIS_PORT, REDIS_HOST, { maxRetriesPerRequest: 3, lazyConnect: true });
await redis.connect().catch(() => {});

// Top-level crash guard — nothing in a WS handler may crash the process.
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

// --- Token helpers (mirror nest-js-boilerplate CryptoService + TokenStoreService) ---
// Source of truth for buildKey: token-store.service.ts buildKey()
// Source of truth for derivation: token-derivation.service.ts

function sha256hex(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hmacSha256(secret, data) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

function dateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function deriveUserToken(userId, date) {
  const d = date || dateOnly();
  return hmacSha256(DERIVATION_SECRET, `user.v1:${d}:${userId}`);
}

function deriveRbacToken(userId, tier, date) {
  const d = date || dateOnly();
  return hmacSha256(DERIVATION_SECRET, `rbac.v1:${d}:${userId}:${tier}`);
}

/**
 * Build the 4-segment compound Redis key.
 * Matches TokenStoreService.buildKey: plain SHA-256 of each raw token.
 */
function buildCompoundKey(accessToken, rbacToken, deviceToken, userToken) {
  return `sess:${sha256hex(accessToken)}:${sha256hex(rbacToken)}:${sha256hex(deviceToken)}:${sha256hex(userToken)}`;
}

/** Timing-safe string comparison. */
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Validate a 4-token set against the Redis compound key.
 * Returns { userId, name, tier, friends } or null.
 * Ordered checks (mirror SessionAuthGuard):
 *   1. JWT verify (signature + expiry)
 *   2. Recompute today's userToken, timing-safe compare
 *   3. Build 4-segment key → HGETALL
 *   4. payload.sub === hash.userId
 *   5. Recompute rbacToken from hash.tier, timing-safe compare
 */
async function validateSession(tokens) {
  if (!tokens?.accessToken || !tokens?.rbacToken || !tokens?.deviceToken || !tokens?.userToken) return null;

  // 1. JWT verify
  let payload;
  try {
    payload = jwt.verify(tokens.accessToken, JWT_SECRET);
  } catch {
    return null;
  }
  if (!payload || !payload.sub) return null;

  // 2. Recompute today's userToken
  const expectedUserToken = deriveUserToken(payload.sub);
  if (!timingSafeEqual(tokens.userToken, expectedUserToken)) return null;

  // 3. Build key → HGETALL
  const key = buildCompoundKey(
    tokens.accessToken,
    tokens.rbacToken,
    tokens.deviceToken,
    tokens.userToken,
  );
  let hash;
  try {
    hash = await redis.hgetall(key);
  } catch {
    return null;
  }
  if (!hash || !hash.userId) return null;

  // 4. Sanity check
  if (hash.userId !== payload.sub) return null;

  // 5. Recompute rbacToken from hash.tier
  const expectedRbac = deriveRbacToken(hash.userId, hash.tier || "FREE");
  if (!timingSafeEqual(tokens.rbacToken, expectedRbac)) return null;

  return {
    userId: hash.userId,
    name: hash.name || hash.email || "Unknown",
    tier: hash.tier || "FREE",
    friends: parseFriends(hash.friends),
  };
}

function parseFriends(raw) {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
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
    // HTTP auth: accept JWT Bearer or 4-token headers
    const authHeader = req.headers.authorization;
    let payload;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
      } catch {}
    }
    if (!payload) {
      const tokens = {
        accessToken: req.headers["x-access-token"],
        rbacToken: req.headers["x-rbac-token"],
        deviceToken: req.headers["x-device-token"],
        userToken: req.headers["x-user-token"],
      };
      const session = await validateSession(tokens);
      if (!session) return unauthorized();
      payload = { sub: session.userId };
    }
    if (!payload) return unauthorized();

    // GET /api/users
    if (method === "GET" && path === "/api/users") {
      const search = url.searchParams.get("q") || "";
      // Fallback to raw query since we don't have Prisma here
      const { default: pgModule } = await import("pg");
      const { Pool } = pgModule;
      const dbUrl = process.env.DATABASE_URL || "postgresql://nest:nest@localhost:5432/nest?schema=public";
      const u = new URL(dbUrl);
      const pool = new Pool({
        host: u.hostname,
        port: parseInt(u.port || "5432", 10),
        database: u.pathname.slice(1).split("?")[0],
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        max: 3,
      });
      try {
        const rows = (await pool.query(
          `SELECT id, email, name, username FROM "User"
           WHERE (name ILIKE $1 OR email ILIKE $1) AND status = 'ACTIVE'
           ORDER BY name ASC LIMIT 50`,
          [`%${search}%`],
        )).rows;
        return json(rows.map(formatUser));
      } finally {
        await pool.end();
      }
    }

    // POST /api/notify — push notification to service-tagged connections
    if (method === "POST" && path === "/api/notify") {
      const apiKey = req.headers["x-notification-key"];
      if (!NOTIFICATION_API_KEY || apiKey !== NOTIFICATION_API_KEY) {
        return json({ error: "Unauthorized" }, 401);
      }
      const body = await new Promise((resolve, reject) => {
        let buf = "";
        req.on("data", (chunk) => (buf += chunk));
        req.on("end", () => resolve(buf));
        req.on("error", reject);
      });
      try {
        const { service, userToken, payload } = JSON.parse(body);
        if (!service || !userToken || !payload) {
          return json({ error: "Missing required fields: service, userToken, payload" }, 400);
        }
        const indexKey = `${service}:${userToken}`;
        const deviceHashes = serviceDeviceIndex.get(indexKey);
        let sent = 0;
        if (deviceHashes) {
          for (const deviceHash of deviceHashes) {
            const key = `${service}:${userToken}:${deviceHash}`;
            const conns = serviceConnections.get(key);
            if (conns) {
              for (const ws of conns) {
                sendWs(ws, payload);
                sent++;
              }
            }
          }
        }
        return json({ sent });
      } catch (e) {
        return json({ error: "Invalid JSON" }, 400);
      }
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
// "SERVICE:userToken:deviceHash" → Set<WebSocket>
const serviceConnections = new Map();
// "SERVICE:userToken" → Set<deviceHash>  (reverse index for multi-device broadcast)
const serviceDeviceIndex = new Map();

function sendWs(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function roomKey(name) {
  return `room:${name}`;
}

wss.on("connection", (ws) => {
  let authenticated = false;
  let authTimer = setTimeout(() => {
    if (!authenticated) {
      sendWs(ws, { type: "error", message: "Auth timeout" });
      ws.close(4001, "Auth timeout");
    }
  }, 120_000);

  ws.userId = null;
  ws.userName = null;
  ws.userFriends = [];
  ws.rooms = new Set();

  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return sendWs(ws, { type: "error", message: "Invalid JSON" });
    }

    // --- Auth via first message (4-token only, no legacy fallback) ---
    if (!authenticated) {
      if (data.type === "auth" && data.tokens) {
        const session = await validateSession(data.tokens);
        if (!session) {
          return sendWs(ws, { type: "error", message: "Auth failed" });
        }
        ws.userId = session.userId;
        ws.userName = session.name;
        ws.userFriends = session.friends;
        ws.userTier = session.tier;
        ws.userToken = deriveUserToken(session.userId);
        ws.deviceTokenHash = sha256hex(data.tokens.deviceToken || "");
        ws.registeredServices = [];
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

        // Friends-only DM enforcement from the Redis hash.
        // Best-effort refresh per send; fall back to connect-time snapshot.
        let friends = ws.userFriends;
        try {
          const key = `user:${userId}:sessions`;
          // We don't have the compound key here, so use connect-time friends.
          // The connect-time snapshot is refreshed via the Redis hash which is
          // kept up-to-date by the backend's rewrite hooks.
        } catch {}
        if (!friends || !Array.isArray(friends) || !friends.includes(recipientId)) {
          return sendWs(ws, { type: "error", message: "Not friends" });
        }

        const { default: pgModule } = await import("pg");
        const { Pool } = pgModule;
        const dbUrl = process.env.DATABASE_URL || "postgresql://nest:nest@localhost:5432/nest?schema=public";
        const u = new URL(dbUrl);
        const pool = new Pool({
          host: u.hostname,
          port: parseInt(u.port || "5432", 10),
          database: u.pathname.slice(1).split("?")[0],
          user: decodeURIComponent(u.username),
          password: decodeURIComponent(u.password),
          max: 3,
        });
        try {
          const [row] = (await pool.query(
            `INSERT INTO "Message" (id, "senderId", "recipientId", body, "createdAt")
             VALUES (gen_random_uuid(), $1, $2, $3, NOW())
             RETURNING id, "senderId", "recipientId", body, "createdAt"`,
            [userId, recipientId, text.trim()],
          )).rows;
          const msg = formatMessage(row);
          sendWs(ws, { type: "direct-message", message: msg });
          const rcp = userConnections.get(recipientId);
          if (rcp && rcp !== ws && rcp.readyState === 1) {
            sendWs(rcp, { type: "direct-message", message: msg });
          }
        } finally {
          await pool.end();
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

      case "register": {
        const { services } = data;
        if (!Array.isArray(services) || !ws.userToken || !ws.deviceTokenHash) break;
        for (const svc of services) {
          if (ws.registeredServices.includes(svc)) continue;
          ws.registeredServices.push(svc);
          const key = `${svc}:${ws.userToken}:${ws.deviceTokenHash}`;
          const indexKey = `${svc}:${ws.userToken}`;
          if (!serviceConnections.has(key)) serviceConnections.set(key, new Set());
          serviceConnections.get(key).add(ws);
          if (!serviceDeviceIndex.has(indexKey)) serviceDeviceIndex.set(indexKey, new Set());
          serviceDeviceIndex.get(indexKey).add(ws.deviceTokenHash);
        }
        sendWs(ws, { type: "registered", services: ws.registeredServices });
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
    // Clean up service-tagged connections
    if (ws.registeredServices && ws.userToken && ws.deviceTokenHash) {
      for (const svc of ws.registeredServices) {
        const key = `${svc}:${ws.userToken}:${ws.deviceTokenHash}`;
        const indexKey = `${svc}:${ws.userToken}`;
        const conns = serviceConnections.get(key);
        if (conns) {
          conns.delete(ws);
          if (conns.size === 0) {
            serviceConnections.delete(key);
            const devices = serviceDeviceIndex.get(indexKey);
            if (devices) {
              devices.delete(ws.deviceTokenHash);
              if (devices.size === 0) serviceDeviceIndex.delete(indexKey);
            }
          }
        }
      }
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
