// Compat shim for `next/server`.
// Implements the NextRequest/NextResponse surface the BFF route handlers use,
// on top of the standard Fetch API. The handlers under `src/bff/**` are the
// original Next.js route handlers, dispatched by the TanStack Start catch-all
// server routes in `src/routes/api*`.

export interface CookieSerializeOptions {
  domain?: string;
  expires?: Date | number;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
  priority?: "low" | "medium" | "high";
  partitioned?: boolean;
}

export interface ResponseCookie extends CookieSerializeOptions {
  name: string;
  value: string;
}

export function serializeCookie(
  name: string,
  value: string,
  options: CookieSerializeOptions = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires !== undefined) {
    const date =
      options.expires instanceof Date
        ? options.expires
        : new Date(options.expires);
    parts.push(`Expires=${date.toUTCString()}`);
  }
  if (options.domain) parts.push(`Domain=${options.domain}`);
  parts.push(`Path=${options.path ?? "/"}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.partitioned) parts.push("Partitioned");
  if (options.priority) {
    parts.push(
      `Priority=${options.priority[0]!.toUpperCase()}${options.priority.slice(1)}`,
    );
  }
  if (options.sameSite !== undefined && options.sameSite !== false) {
    const sameSite =
      options.sameSite === true
        ? "Strict"
        : `${options.sameSite[0]!.toUpperCase()}${options.sameSite.slice(1)}`;
    parts.push(`SameSite=${sameSite}`);
  }
  return parts.join("; ");
}

export function parseCookieHeader(header: string | null): Map<string, string> {
  const result = new Map<string, string>();
  if (!header) return result;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"'))
      value = value.slice(1, -1);
    try {
      result.set(name, decodeURIComponent(value));
    } catch {
      result.set(name, value);
    }
  }
  return result;
}

export class RequestCookies {
  private readonly map: Map<string, string>;

  constructor(headers: Headers) {
    this.map = parseCookieHeader(headers.get("cookie"));
  }

  get(name: string): { name: string; value: string } | undefined {
    const value = this.map.get(name);
    return value === undefined ? undefined : { name, value };
  }

  getAll(): Array<{ name: string; value: string }> {
    return [...this.map.entries()].map(([name, value]) => ({ name, value }));
  }

  has(name: string): boolean {
    return this.map.has(name);
  }

  set(name: string, value: string): this {
    this.map.set(name, value);
    return this;
  }

  delete(name: string): boolean {
    return this.map.delete(name);
  }

  get size(): number {
    return this.map.size;
  }
}

export class ResponseCookies {
  constructor(private readonly headers: Headers) {}

  set(
    nameOrOptions: string | ResponseCookie,
    value?: string,
    options?: CookieSerializeOptions,
  ): this {
    if (typeof nameOrOptions === "string") {
      this.headers.append(
        "set-cookie",
        serializeCookie(nameOrOptions, value ?? "", options),
      );
    } else {
      const { name, value: cookieValue, ...rest } = nameOrOptions;
      this.headers.append(
        "set-cookie",
        serializeCookie(name, cookieValue, rest),
      );
    }
    return this;
  }

  delete(
    name: string | { name: string; path?: string; domain?: string },
  ): this {
    const opts =
      typeof name === "string" ? { name, path: "/" } : { path: "/", ...name };
    this.headers.append(
      "set-cookie",
      serializeCookie(opts.name, "", {
        path: opts.path,
        domain: opts.domain,
        maxAge: 0,
        expires: new Date(0),
      }),
    );
    return this;
  }

  get(name: string): ResponseCookie | undefined {
    const all = this.getAll();
    return all.find((cookie) => cookie.name === name);
  }

  getAll(): Array<ResponseCookie> {
    return this.headers
      .getSetCookie()
      .map((line) => {
        const [pair] = line.split(";");
        const eq = pair?.indexOf("=") ?? -1;
        if (!pair || eq === -1) return undefined;
        return {
          name: pair.slice(0, eq).trim(),
          value: decodeURIComponent(pair.slice(eq + 1).trim()),
        };
      })
      .filter((cookie): cookie is ResponseCookie => cookie !== undefined);
  }
}

export class NextURL extends URL {
  basePath = "";

  clone(): NextURL {
    return new NextURL(this.href);
  }
}

export class NextRequest extends Request {
  readonly nextUrl: NextURL;
  readonly cookies: RequestCookies;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init);
    this.nextUrl = new NextURL(this.url);
    this.cookies = new RequestCookies(this.headers);
  }

  get ip(): string | undefined {
    return undefined;
  }

  get geo(): Record<string, string | undefined> {
    return {};
  }
}

/**
 * Adapt any spec-compliant Request into a NextRequest without re-constructing
 * it (the runtime's Request may not be undici's — e.g. srvx in TanStack
 * Start — and cross-implementation cloning throws). The proxy overlays
 * `nextUrl`/`cookies` and binds everything else to the original instance.
 */
export function toNextRequest(request: Request): NextRequest {
  if (request instanceof NextRequest) return request;
  const nextUrl = new NextURL(request.url);
  const cookies = new RequestCookies(request.headers);
  return new Proxy(request, {
    get(target, prop) {
      if (prop === "nextUrl") return nextUrl;
      if (prop === "cookies") return cookies;
      if (prop === "ip") return undefined;
      if (prop === "geo") return {};
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  }) as NextRequest;
}

const NEXT_MARKER = Symbol("next-response-next");

export class NextResponse<_Body = unknown> extends Response {
  readonly cookies: ResponseCookies;
  /** Present on responses created via NextResponse.next() (middleware only). */
  [NEXT_MARKER]?: boolean;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
    this.cookies = new ResponseCookies(this.headers);
  }

  static json<JsonBody>(
    data: JsonBody,
    init?: ResponseInit,
  ): NextResponse<JsonBody> {
    const headers = new Headers(init?.headers);
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    return new NextResponse<JsonBody>(JSON.stringify(data), {
      ...init,
      headers,
    });
  }

  static redirect(
    url: string | URL | NextURL,
    init?: number | ResponseInit,
  ): NextResponse {
    const status = typeof init === "number" ? init : (init?.status ?? 307);
    const headers = new Headers(
      typeof init === "number" ? undefined : init?.headers,
    );
    headers.set("location", url.toString());
    return new NextResponse(null, {
      ...(typeof init === "number" ? {} : init),
      status,
      headers,
    });
  }

  static next(init?: {
    request?: { headers?: Headers };
    headers?: HeadersInit;
    status?: number;
  }): NextResponse {
    const response = new NextResponse(null, {
      status: init?.status ?? 200,
      headers: init?.headers,
    });
    response[NEXT_MARKER] = true;
    return response;
  }

  static rewrite(): NextResponse {
    throw new Error(
      "NextResponse.rewrite() is not supported by the TanStack Start compat layer",
    );
  }

  static isNext(response: Response): boolean {
    return response instanceof NextResponse && response[NEXT_MARKER] === true;
  }
}

/**
 * Next 15+ `connection()` — resolves when the request is "live".
 * There is no prerendering pipeline here, so it resolves immediately.
 */
export async function connection(): Promise<void> {}

export type NextFetchEvent = {
  waitUntil: (promise: Promise<unknown>) => void;
};

export function userAgent(_input: { headers: Headers }): {
  isBot: boolean;
  ua: string;
} {
  const ua = _input.headers.get("user-agent") ?? "";
  return { isBot: /bot|crawler|spider|crawling/i.test(ua), ua };
}

export function after(task: Promise<unknown> | (() => unknown)): void {
  // Fire the task without blocking the response — closest equivalent of
  // next/server's `after()` without a request-lifecycle hook.
  void Promise.resolve()
    .then(() => (typeof task === "function" ? task() : task))
    .catch(() => {});
}
