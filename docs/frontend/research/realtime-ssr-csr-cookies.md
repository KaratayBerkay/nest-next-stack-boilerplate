# Realtime + SSR/CSR Cookies — Research Notes

> Local-only notes (gitignored). Focused on the core of this boilerplate: BFF proxy,
> cookie handling across SSR/CSR, SSE, and consuming NestJS WebSockets.

## BFF proxy + cookies (the core)

- Next.js is server-rendered by default → use **Route Handlers as a BFF proxy** between
  the browser and NestJS. The browser only ever talks to Next.js.
- **Reading cookies (SSR):** `cookies()` from `next/headers` works in Server Components
  and Route Handlers. You can **read** but **cannot modify** cookies inside a Server
  Component.
- **Writing cookies:** must happen in a **Route Handler** or a **Server Action** (set on
  the response). The login flow posts credentials to NestJS, takes the returned token and
  sets an **`httpOnly`, `Secure`, `SameSite=Lax`** cookie.
- **Forwarding credentials to NestJS:** read the incoming cookie with `cookies()` and pass
  it in the outgoing request header to NestJS; relay any `Set-Cookie` back to the browser.
- **CSR limitation (the teaching point):** `httpOnly` cookies are **not** readable by
  client JS. A CSR page therefore cannot read the session directly — it must call
  `/api/auth/me`. The SSR page, by contrast, reads the cookie server-side. Demo both
  side by side.

### Security

- `httpOnly` → not accessible to JS (mitigates XSS token theft).
- `SameSite=Lax`/`Strict` → mitigates CSRF. Avoid client-set non-`httpOnly` cookies.

## SSE (Server-Sent Events)

- One-way, server → client, over plain HTTP. Good for notifications, feeds, progress
  bars, live dashboards, AI/LLM token streaming.
- In the App Router, Route Handlers use **Web-standard Request/Response**, so implement
  SSE with **`ReadableStream`** (or `TransformStream`) emitting `text/event-stream` —
  NOT the Node `res.write()` pattern.
- Consume on the client via `EventSource` inside a `"use client"` component / hook
  (`useSSE`), with reconnect + cleanup on unmount.
- **Deploy caveat:** long-lived SSE does not work on Vercel **Serverless** Functions
  (~10s timeout). Use Edge Functions or a standalone Node server.

## WebSocket (consumed from NestJS)

- Next.js Route Handlers **cannot** serve raw WebSockets — that requires a custom server
  (`ws`/`socket.io`), which disables some optimizations and Vercel serverless deploy.
- **Our choice:** the WS server lives in **NestJS** (WS Gateways). The browser connects
  **directly** to NestJS via native `WebSocket` from a `"use client"` hook
  (`useWebSocket`) using `NEXT_PUBLIC_WS_URL`, with reconnect/backoff + cleanup.
- `"use client"` is mandatory — on the server `WebSocket` is undefined (ReferenceError).
- **Cross-origin WS auth caveat:** a browser WebSocket to a different origin will only
  send the auth cookie if it is readable cross-site (`SameSite=None; Secure`), otherwise
  pass a short-lived token on connect (query param / subprotocol). Document the chosen
  approach in the boilerplate.
- `ws` vs `socket.io`: `socket.io` adds reconnection, fallbacks and rooms at the cost of
  overhead; `ws` is leaner with maximum control. Match whatever the NestJS gateway uses.

## Sources

- SSE in Next.js: https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/
- SSE in API routes (gotchas): https://github.com/vercel/next.js/discussions/48427
- WS with Next.js (concepts): https://websocket.org/guides/frameworks/nextjs/
- Socket.IO + Next.js: https://socket.io/how-to/use-with-nextjs
- JWT auth w/ external backend (SSR): https://www.thewidlarzgroup.com/blog/nextjs-ssr---jwt-access-refresh-token-authentication-with-external-backend
- Cookies in Next.js: https://www.propelauth.com/post/cookies-in-next-js
- WebSockets vs SSE (when to use): https://ably.com/blog/websockets-vs-sse
