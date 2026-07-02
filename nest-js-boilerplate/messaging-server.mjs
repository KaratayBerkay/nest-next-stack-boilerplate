import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
const DB_URL = process.env.DATABASE_URL || "postgresql://nest:nest@localhost:5432/nest?schema=public";
const PORT = parseInt(process.env.MSG_PORT || "3003", 10);

import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";

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
import Pool from "pg-pool";
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

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const url = new URL(req.url, "http://localhost");
  return url.searchParams.get("token") || null;
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
    const token = extractToken(req);
    const payload = verifyToken(token);
    if (!token || !payload) return unauthorized();

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

      const [row] = await query(
        `INSERT INTO "Message" (id, "senderId", "recipientId", body, "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         RETURNING id, "senderId", "recipientId", body, "createdAt"`,
        [payload.sub, otherId, text.trim()],
      );
      const msg = formatMessage(row);

      // Deliver via WS if recipient is connected
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
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");
  const payload = verifyToken(token);
  if (!payload) {
    sendWs(ws, { type: "error", message: "Unauthorized: invalid token" });
    ws.close(4001, "Unauthorized");
    return;
  }

  const userId = payload.sub;
  const userName = payload.name || payload.email;
  ws.userId = userId;
  ws.userName = userName;
  ws.rooms = new Set();
  userConnections.set(userId, ws);

  sendWs(ws, { type: "connected", userId, name: userName });

  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return sendWs(ws, { type: "error", message: "Invalid JSON" });
    }

    switch (data.type) {
      // --- Direct messaging ---
      case "direct-message": {
        const { recipientId, text } = data;
        if (!recipientId || !text?.trim()) break;
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

      // --- Chat rooms ---
      case "join-room": {
        const room = data.room;
        if (!room) break;
        ws.rooms.add(room);
        if (!chatRooms.has(room)) chatRooms.set(room, new Set());
        chatRooms.get(room).add(userId);
        const avatar = getInitials(userName);
        broadcastToRoom(room, {
          type: "user-joined",
          room,
          user: { id: userId, name: userName, avatar },
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
          user: { id: userId, name: userName, avatar: getInitials(userName) },
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
            senderName: userName,
            avatar: getInitials(userName),
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
    if (userConnections.get(userId) === ws) userConnections.delete(userId);
    for (const room of ws.rooms) {
      chatRooms.get(room)?.delete(userId);
      if (chatRooms.get(room)?.size === 0) chatRooms.delete(room);
      broadcastToRoom(room, {
        type: "user-left",
        room,
        user: { id: userId, name: userName, avatar: getInitials(userName) },
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
  // Always send to the sender too (for confirmation)
  if (excludeWs && excludeWs.readyState === 1) {
    sendWs(excludeWs, data);
  }
}

// --- Helpers ---
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
  console.log(`Messaging server running on :${PORT}`);
  console.log(`  HTTP API: http://localhost:${PORT}/api/`);
  console.log(`  WS:       ws://localhost:${PORT}?token=xxx`);
});
