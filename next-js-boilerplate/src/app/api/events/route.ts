import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { eventsBatchSchema } from "@/lib/events.schema";
import { publishEvent } from "@/lib/kafka";
import { getAccessToken } from "@/store/ssr-cookies";
import { graphqlFetch } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

type DeviceType = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

function parseDeviceType(ua?: string | null): DeviceType {
  if (!ua) return "unknown";
  const u = ua.toLowerCase();
  if (/bot|crawler|spider|googlebot|headless/i.test(u)) return "bot";
  if (/ipad|tablet|playbook|kindle|(android(?!.*mobile))/i.test(u))
    return "tablet";
  if (
    /mobile|iphone|ipod|blackberry|opera mini|android.*mobile|iemobile/i.test(u)
  )
    return "mobile";
  return "desktop";
}

const TOPIC = "frontend-events";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateBuckets = new Map<string, number[]>();

function evictStaleRateBuckets(): void {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS * 2;
  for (const [key, timestamps] of rateBuckets) {
    const recent = timestamps.filter((t) => t > cutoff);
    if (recent.length === 0) rateBuckets.delete(key);
    else rateBuckets.set(key, recent);
  }
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  let timestamps = rateBuckets.get(key);
  if (!timestamps) {
    timestamps = [];
    rateBuckets.set(key, timestamps);
  }
  const recent = timestamps.filter((t) => t > windowStart);
  recent.push(now);
  rateBuckets.set(key, recent);
  // Evict stale entries every 100th call to prevent unbounded growth
  if (Math.random() < 0.01) evictStaleRateBuckets();
  return recent.length <= RATE_LIMIT_MAX;
}

const ME_QUERY = `
  query Me {
    me {
      id
      sessionId
    }
  }
`;

interface MeResult {
  me: { id: string; sessionId?: string | null } | null;
}

async function resolveMe(): Promise<{ userId?: string; sessionId?: string }> {
  try {
    const token = await getAccessToken();
    if (!token) return {};
    const { data } = await graphqlFetch<MeResult>(ME_QUERY, undefined, token);
    if (!data?.me) return {};
    return { userId: data.me.id, sessionId: data.me.sessionId ?? undefined };
  } catch {
    return {};
  }
}

const CATEGORY_EVENTS = new Set([
  "session",
  "page",
  "http-exception",
  "application-exception",
  "network",
  "database",
  "performance",
]);

export const POST = withLogging(async (request, log) => {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(ip)) {
    log.warn(
      { ip, category: "network", event: "network.rate_limited" },
      "rate limit exceeded",
    );
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = eventsBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { events } = parsed.data;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const { userId, sessionId } = await resolveMe();
  const enriched = events.map((e) => ({
    ...e,
    userId: userId ?? e.userId,
    token: sessionId,
    ip: ip === "unknown" ? undefined : ip,
    deviceType: parseDeviceType(e.userAgent ?? userAgent),
  }));

  const categoryEvents: Record<string, unknown>[] = [];
  const legacyEvents: Record<string, unknown>[] = [];

  for (const event of enriched) {
    if (event.category && CATEGORY_EVENTS.has(event.category)) {
      categoryEvents.push(event);
    } else {
      legacyEvents.push(event);
    }
  }

  for (const event of categoryEvents) {
    log.info(event, "category event");
  }

  if (legacyEvents.length > 0) {
    publishEvent(TOPIC, {
      events: legacyEvents,
      receivedAt: new Date().toISOString(),
    }).catch(() => {});
  }

  log.info(
    { count: events.length, userId: userId ?? "anonymous", sessionId },
    "events accepted",
  );
  return NextResponse.json({ accepted: events.length }, { status: 202 });
});
