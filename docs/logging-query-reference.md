# Structured Logging — Query Reference

All structured events flow:

```
Pino → stdout → Docker fluentd → Fluent Bit → rewrite_tag by $category → ES index
```

Each `category` routes to its own ES index. This doc lists every event, where it's emitted,
what fields it carries, and how to query it.

---

## `session` — `session-logs`

Backend session lifecycle. Emitted by `auth.service.ts`, `session-auth.guard.ts`, `realtime.gateway.ts`.

| event | when | fields |
|---|---|---|
| `session.start` | User logs in, tokens issued | `token`, `userId`, `ip`, `deviceId`, `deviceType`, `userAgent`, `issuedAt` |
| `session.end` | User logs out | `token`, `userId`, `sessionDurationMs`, `reason` |
| `session.ip_change` | Request IP differs from session IP | `token`, `userId`, `oldIp`, `newIp`, `userAgent`, `deviceType` |
| `session.ua_change` | User-Agent changed | `token`, `userId`, `userAgent`, `deviceType` |
| `ws.connect` | WebSocket connection established | `ip`, `userAgent`, `deviceType` |
| `ws.auth_success` | WebSocket auth succeeded | `token`, `userId`, `socketId` |
| `ws.auth_fail` | WebSocket auth failed | `reason`, `userId` (if known) |
| `ws.disconnect` | WebSocket closed | `token`, `userId`, `socketId` |
| `ws.heartbeat_timeout` | WebSocket ping/pong timeout | `token`, `userId`, `socketId` |

```bash
# All events for a specific user
curl -s 'http://10.10.2.175:9200/session-logs/_search?size=50' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"userId":"usr_abc123"}}}' | python3 -m json.tool

# WebSocket auth failures in last hour
curl -s 'http://10.10.2.175:9200/session-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"ws.auth_fail"}},{"range":{"@timestamp":{"gte":"now-1h"}}}]}}}' | python3 -m json.tool

# Active connections (last 5 min)
curl -s 'http://10.10.2.175:9200/session-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"ws.connect"}},{"range":{"@timestamp":{"gte":"now-5m"}}}]}}}' | python3 -m json.tool
```

---

## `page` — `page-logs`

Frontend page navigation. Emitted by `useEventLogger.ts` (client hook).

| event | when | fields |
|---|---|---|
| `page.view` | User navigates to a page | `url`, `category`, `event`, `page`, `userId` |
| `page.exit` | User leaves a page | `url`, `category`, `event`, `page`, `durationMs`, `userId` |

```bash
# Slow pages (exit duration > 30s)
curl -s 'http://10.10.2.175:9200/page-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"page.exit"}},{"range":{"durationMs":{"gt":30000}}}]}}}' | python3 -m json.tool

# Most visited pages today
curl -s 'http://10.10.2.175:9200/page-logs/_search?size=50' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"page.view"}},{"range":{"@timestamp":{"gte":"now-24h"}}}]}},"aggs":{"pages":{"terms":{"field":"page","size":10}}}}' | python3 -m json.tool

# Bounce rate (single-page visits, durationMs < 5s)
curl -s 'http://10.10.2.175:9200/page-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"page.exit"}},{"range":{"durationMs":{"lt":5000}}}]}}}' | python3 -m json.tool
```

---

## `network` — `network-logs`

Network-level events (rate limits, CSRF failures, connectivity). Emitted by Nest.js guards and
frontend `useNetworkLogger` hook.

| event | when | source | fields |
|---|---|---|---|
| `network.rate_limited` | Request throttled (429) | `HttpThrottlerGuard`, `events/route.ts` | `ip`, `path`, `method`, `userAgent`, `deviceType` |
| `network.csrf_fail` | CSRF token invalid/missing (403) | `CsrfGuard` | `ip`, `path`, `method`, `userAgent`, `deviceType` |
| `network.offline` | Browser lost connectivity | `useNetworkLogger` (frontend) | `url` |
| `network.online` | Browser regained connectivity | `useNetworkLogger` (frontend) | `url` |

```bash
# Rate-limited requests in last 24h
curl -s 'http://10.10.2.175:9200/network-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"network.rate_limited"}},{"range":{"@timestamp":{"gte":"now-24h"}}}]}}}' | python3 -m json.tool

# All CSRF failures (possible attack or misconfigured client)
curl -s 'http://10.10.2.175:9200/network-logs/_search?size=50' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"network.csrf_fail"}}}' | python3 -m json.tool

# Top IPs hitting rate limits
curl -s 'http://10.10.2.175:9200/network-logs/_search?size=0' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"network.rate_limited"}},"aggs":{"ips":{"terms":{"field":"ip","size":10}}}}' | python3 -m json.tool

# Connectivity issues (users going offline)
curl -s 'http://10.10.2.175:9200/network-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"network.offline"}}}' | python3 -m json.tool
```

---

## `database` — `database-logs`

Database query performance and errors. Emitted by `PrismaService` via Prisma `$on('query')` /
`$on('error')` event listeners.

| event | when | fields |
|---|---|---|
| `db.query_slow` | Prisma query exceeded 500ms threshold | `query`, `durationMs`, `params` |
| `db.query_error` | Prisma query threw an error | `errorMessage` |

```bash
# Slow queries (>500ms) in last hour — ordered by duration
curl -s 'http://10.10.2.175:9200/database-logs/_search?size=50' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"db.query_slow"}},{"range":{"@timestamp":{"gte":"now-1h"}}}]}},"sort":[{"durationMs":{"order":"desc"}}]}' | python3 -m json.tool

# Database errors
curl -s 'http://10.10.2.175:9200/database-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"db.query_error"}}}' | python3 -m json.tool

# Most common slow query patterns
curl -s 'http://10.10.2.175:9200/database-logs/_search?size=0' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"db.query_slow"}},"aggs":{"queries":{"significant_text":{"field":"query"}}}}' | python3 -m json.tool
```

---

## `performance` — `performance-logs`

Application performance metrics. Backend slow requests from `PerformanceInterceptor` and frontend
Core Web Vitals from `usePerformanceLogger` (`useReportWebVitals`).

| event | when | source | fields |
|---|---|---|---|
| `perf.slow_request` | Nest.js handler exceeded 1s | `PerformanceInterceptor` | `method`, `path`, `durationMs`, `statusCode`, `ip`, `userAgent`, `deviceType` |
| `perf.page_lcp` | Largest Contentful Paint | `usePerformanceLogger` | `url`, `value`, `rating`, `metadata` |
| `perf.page_fid` | First Input Delay | `usePerformanceLogger` | `url`, `value`, `rating` |
| `perf.page_cls` | Cumulative Layout Shift | `usePerformanceLogger` | `url`, `value`, `rating` |
| `perf.page_ttfb` | Time to First Byte | `usePerformanceLogger` | `url`, `value`, `rating` |
| `perf.page_fcp` | First Contentful Paint | `usePerformanceLogger` | `url`, `value`, `rating` |
| `perf.page_inp` | Interaction to Next Paint | `usePerformanceLogger` | `url`, `value`, `rating` |

```bash
# Slowest backend requests today
curl -s 'http://10.10.2.175:9200/performance-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"perf.slow_request"}},{"range":{"@timestamp":{"gte":"now-24h"}}}]}},"sort":[{"durationMs":{"order":"desc"}}]}' | python3 -m json.tool

# Poor LCP scores (>2500ms = needs improvement / poor)
curl -s 'http://10.10.2.175:9200/performance-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"perf.page_lcp"}},{"range":{"@timestamp":{"gte":"now-24h"}}}]}},"sort":[{"durationMs":{"order":"desc"}}]}' | python3 -m json.tool

# All poor Core Web Vitals (rating = "needs-improvement" or "poor")
curl -s 'http://10.10.2.175:9200/performance-logs/_search?size=50' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"prefix":{"event":"perf.page_"}},{"range":{"@timestamp":{"gte":"now-24h"}}}]}}}' | python3 -m json.tool

# Average LCP by page (using metric metadata.value)
curl -s 'http://10.10.2.175:9200/performance-logs/_search?size=0' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"perf.page_lcp"}},"aggs":{"by_page":{"terms":{"field":"url","size":10},"aggs":{"avg_lcp":{"avg":{"field":"durationMs"}}}}}}' | python3 -m json.tool

# Slowest API endpoints (by average duration)
curl -s 'http://10.10.2.175:9200/performance-logs/_search?size=0' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"perf.slow_request"}},"aggs":{"endpoints":{"terms":{"field":"path","size":10},"aggs":{"avg_duration":{"avg":{"field":"durationMs"}}}}}}' | python3 -m json.tool
```

---

## `exception` — Exception logs

Three sub-categories route through Fluent Bit to their own indices:

| ES index | category value | description |
|---|---|---|
| `http-exception-logs` | `http-exception` | HTTP error responses (4xx, 5xx) |
| `websocket-exception-logs` | `websocket-exception` | WebSocket errors, connection losses |
| `application-exception-logs` | `application-exception` | Client-side exceptions (frontend) |

Backend exceptions are caught by `GlobalHttpExceptionFilter`, WebSocket exceptions by
`AllWsExceptionsFilter` / `WsExceptionFilter`. Frontend exceptions are caught by
`useEventLogger` (error / unhandledrejection events in the browser).

### `http-exception` — `http-exception-logs`

| event | when | fields |
|---|---|---|
| `exception.unhandled` | 5xx server error | `httpStatus`, `path`, `method`, `ip`, `userAgent`, `deviceType`, `errorMessage`, `stack` |
| `exception.handled` | 4xx client error | `httpStatus`, `path`, `method`, `ip`, `userAgent`, `deviceType`, `errorMessage` |

### `websocket-exception` — `websocket-exception-logs`

| event | when | fields |
|---|---|---|
| `exception.websocket` | Unhandled WS error | `socketId`, `ip`, `userAgent`, `deviceType`, `errorMessage`, `stack` |
| `exception.ws_handled` | Handled WS error | `socketId`, `ip`, `userAgent`, `deviceType`, `detail` |
| `connection-loss` | Abnormal WS close | `token`, `userId`, `code`, `reason` |
| `device-change` | Device IP mismatch | `deviceId`, `previousIp`, `newIp` |

### `application-exception` — `application-exception-logs`

| event | when | fields |
|---|---|---|
| `exception` | Browser `window.onerror` | `url`, `exceptionType`, `message`, `stack` |
| `CLIENT_REQUEST_ERROR` | Next.js `onRequestError` | `route`, `message` |

```bash
# All 5xx errors in last 24h
curl -s 'http://10.10.2.175:9200/http-exception-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"exception.unhandled"}},{"range":{"@timestamp":{"gte":"now-24h"}}}]}}}' | python3 -m json.tool

# Most common error messages
curl -s 'http://10.10.2.175:9200/http-exception-logs/_search?size=0' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"exception.unhandled"}},"aggs":{"errors":{"significant_text":{"field":"errorMessage"}}}}' | python3 -m json.tool

# Connection losses with abnormal close codes (>1001)
curl -s 'http://10.10.2.175:9200/websocket-exception-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"bool":{"filter":[{"term":{"event":"connection-loss"}},{"range":{"code":{"gt":1001}}}]}}}' | python3 -m json.tool

# Frontend client errors
curl -s 'http://10.10.2.175:9200/application-exception-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"exception"}}}' | python3 -m json.tool

# Device IP changes
curl -s 'http://10.10.2.175:9200/websocket-exception-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"device-change"}}}' | python3 -m json.tool

# Errors by path (top 10)
curl -s 'http://10.10.2.175:9200/http-exception-logs/_search?size=0' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"event":"exception.unhandled"}},"aggs":{"paths":{"terms":{"field":"path","size":10}}}}' | python3 -m json.tool
```

---

## Cross-index queries

### Trace a user across all logs

```bash
curl -s 'http://10.10.2.175:9200/session-logs,http-exception-logs,network-logs/_search?size=20' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"term":{"userId":"usr_abc123"}},"sort":[{"@timestamp":{"order":"desc"}}]}' | python3 -m json.tool
```

### All events in the last 5 minutes (recent activity)

```bash
curl -s 'http://10.10.2.175:9200/*-logs/_search?size=50' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"range":{"@timestamp":{"gte":"now-5m"}}},"sort":[{"@timestamp":{"order":"desc"}}]}' | python3 -m json.tool
```

### Errors by service

```bash
curl -s 'http://10.10.2.175:9200/http-exception-logs/_search?size=0' \
  -H 'Content-Type: application/json' \
  -d '{"query":{"range":{"@timestamp":{"gte":"now-24h"}}},"aggs":{"services":{"terms":{"field":"service","size":10}}}}' | python3 -m json.tool
```

---

## Quick CLI Queries (copy-paste)

| Log type | Command |
|---|---|---|
| Session | `curl -s 'http://10.10.2.175:9200/session-logs/_search?size=20' \| python3 -m json.tool` |
| Page | `curl -s 'http://10.10.2.175:9200/page-logs/_search?size=20' \| python3 -m json.tool` |
| Network | `curl -s 'http://10.10.2.175:9200/network-logs/_search?size=20' \| python3 -m json.tool` |
| Database | `curl -s 'http://10.10.2.175:9200/database-logs/_search?size=20' \| python3 -m json.tool` |
| Performance | `curl -s 'http://10.10.2.175:9200/performance-logs/_search?size=20' \| python3 -m json.tool` |
| HTTP Exception | `curl -s 'http://10.10.2.175:9200/http-exception-logs/_search?size=20' \| python3 -m json.tool` |
| WS Exception | `curl -s 'http://10.10.2.175:9200/websocket-exception-logs/_search?size=20' \| python3 -m json.tool` |
| App Exception | `curl -s 'http://10.10.2.175:9200/application-exception-logs/_search?size=20' \| python3 -m json.tool` |
| Payment | `curl -s 'http://10.10.2.175:9200/payment-logs/_search?size=20' \| python3 -m json.tool` |
| Billing | `curl -s 'http://10.10.2.175:9200/billing-logs/_search?size=20' \| python3 -m json.tool` |
| All backend | `curl -s 'http://10.10.2.175:9200/app-logs/_search?size=20' \| python3 -m json.tool` |
| All frontend | `curl -s 'http://10.10.2.175:9200/frontend-logs/_search?size=20' \| python3 -m json.tool` |
