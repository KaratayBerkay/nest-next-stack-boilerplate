import "server-only";
import { NextResponse } from "next/server";
import { eventsBatchSchema } from "@/validators/events/schema";
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
const RATE_LIMIT_MAX_BUCKETS = 10_000;
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
    // Bound the map before admitting a new key: distinct (spoofed or real)
    // keys must not grow memory without limit. Evict stale buckets first;
    // if still full, drop the oldest-inserted one (Map preserves insertion
    // order), which sheds attacker churn before long-lived legit buckets.
    if (rateBuckets.size >= RATE_LIMIT_MAX_BUCKETS) {
      evictStaleRateBuckets();
      while (rateBuckets.size >= RATE_LIMIT_MAX_BUCKETS) {
        const oldest = rateBuckets.keys().next().value;
        if (oldest === undefined) break;
        rateBuckets.delete(oldest);
      }
    }
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
    }
  }
`;

interface MeResult {
  me: { id: string } | null;
}

async function resolveMe(): Promise<{ userId?: string }> {
  try {
    const token = await getAccessToken();
    if (!token) return {};
    const { data } = await graphqlFetch<MeResult>(ME_QUERY, undefined, token);
    if (!data?.me) return {};
    return { userId: data.me.id };
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
  "rtc",
]);

export const POST = withLogging(async (request, log) => {
  // Rate-limit key. x-real-ip first: the fronting proxy (openresty) sets it
  // from the socket address, so a client can't choose its own bucket. The
  // FIRST x-forwarded-for hop is client-writable (`curl -H`) — trusting it
  // let an attacker mint a fresh bucket per request and bypass the limit
  // entirely; the LAST hop is the one our own proxy appended.
  const xff = request.headers.get("x-forwarded-for");
  const lastForwardedHop = xff?.split(",").at(-1)?.trim();
  const ip =
    request.headers.get("x-real-ip")?.trim() || lastForwardedHop || "unknown";
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

  const { userId } = await resolveMe();
  const enriched = events.map((e) => ({
    ...e,
    userId: userId ?? e.userId,
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
    { count: events.length, userId: userId ?? "anonymous" },
    "events accepted",
  );
  return NextResponse.json({ accepted: events.length }, { status: 202 });
});
