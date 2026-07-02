import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { eventsBatchSchema } from "@/lib/events.schema";
import { publishEvent } from "@/lib/kafka";
import { getAccessToken } from "@/store/ssr-cookies";
import { graphqlFetch } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

const TOPIC = "frontend-events";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateBuckets = new Map<string, number[]>();

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
  return recent.length <= RATE_LIMIT_MAX;
}

const ME_QUERY = `
  query Me {
    me {
      id
    }
  }
`;

async function resolveUserId(): Promise<string | undefined> {
  try {
    const token = await getAccessToken();
    if (!token) return undefined;
    const { data } = await graphqlFetch<{ me: { id: string } }>(
      ME_QUERY,
      undefined,
      token,
    );
    return data?.me?.id;
  } catch {
    return undefined;
  }
}

export const POST = withLogging(async (request, log) => {
  // Rate limit by client IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(ip)) {
    log.warn({ ip }, "rate limit exceeded");
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

  // Resolve the real user from the session and overwrite any client-sent userId
  const userId = await resolveUserId();
  const enriched = events.map((e) => ({
    ...e,
    userId: userId ?? e.userId,
  }));

  // Fire-and-forget: never block the response on Kafka
  publishEvent(TOPIC, {
    events: enriched,
    receivedAt: new Date().toISOString(),
  }).catch(() => {});

  log.info(
    { count: events.length, userId: userId ?? "anonymous" },
    "events accepted",
  );
  return NextResponse.json({ accepted: events.length }, { status: 202 });
});
