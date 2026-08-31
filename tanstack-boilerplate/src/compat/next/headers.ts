// Compat shim for `next/headers`.
// `cookies()` and `headers()` read/write the current server request context
// via TanStack Start's request-response helpers. Only callable on the server
// (inside server functions, server route handlers, or request middleware) —
// exactly the contexts where the original Next code called them.
// The server module is imported lazily so client bundles that transitively
// reach this file never pull server-only code at module scope.

export interface RequestCookie {
  name: string;
  value: string;
}

export interface CookieSetOptions {
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

type StartServerModule = typeof import("@tanstack/react-start/server");

let serverModule: StartServerModule | undefined;

async function loadServerModule(): Promise<StartServerModule> {
  if (!serverModule) {
    serverModule = await import("@tanstack/react-start/server");
  }
  return serverModule;
}

function normalizeExpires(
  expires: Date | number | undefined,
): Date | undefined {
  if (expires === undefined) return undefined;
  return expires instanceof Date ? expires : new Date(expires);
}

export class ReadonlyRequestCookies {
  constructor(private readonly mod: StartServerModule) {}

  get(name: string): RequestCookie | undefined {
    const value = this.mod.getCookie(name);
    return value === undefined ? undefined : { name, value };
  }

  getAll(): Array<RequestCookie> {
    return Object.entries(this.mod.getCookies()).map(([name, value]) => ({
      name,
      value,
    }));
  }

  has(name: string): boolean {
    return this.mod.getCookie(name) !== undefined;
  }

  set(
    nameOrOptions:
      string | ({ name: string; value: string } & CookieSetOptions),
    value?: string,
    options?: CookieSetOptions,
  ): this {
    if (typeof nameOrOptions === "string") {
      const { expires, ...rest } = options ?? {};
      this.mod.setCookie(nameOrOptions, value ?? "", {
        ...rest,
        expires: normalizeExpires(expires),
      });
    } else {
      const { name, value: cookieValue, expires, ...rest } = nameOrOptions;
      this.mod.setCookie(name, cookieValue, {
        ...rest,
        expires: normalizeExpires(expires),
      });
    }
    return this;
  }

  delete(
    name: string | { name: string; path?: string; domain?: string },
  ): this {
    if (typeof name === "string") {
      this.mod.deleteCookie(name, { path: "/" });
    } else {
      const { name: cookieName, ...rest } = name;
      this.mod.deleteCookie(cookieName, { path: "/", ...rest });
    }
    return this;
  }

  /** Serialize as a Cookie request header, matching next/headers. */
  toString(): string {
    return this.getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
  }

  [Symbol.iterator](): IterableIterator<[string, RequestCookie]> {
    return new Map(
      this.getAll().map((cookie) => [cookie.name, cookie] as const),
    )[Symbol.iterator]();
  }

  get size(): number {
    return this.getAll().length;
  }
}

export async function cookies(): Promise<ReadonlyRequestCookies> {
  const mod = await loadServerModule();
  return new ReadonlyRequestCookies(mod);
}

export async function headers(): Promise<Headers> {
  const mod = await loadServerModule();
  return new Headers(mod.getRequest().headers);
}

export async function draftMode(): Promise<{
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
}> {
  return { isEnabled: false, enable: () => {}, disable: () => {} };
}
