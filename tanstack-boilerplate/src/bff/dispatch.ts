// BFF dispatcher — routes /api/* requests to the Next.js-style route handlers
// under src/bff/** (kept verbatim from the original app; NextRequest /
// NextResponse come from the compat layer). Pattern semantics mirror the
// app-router: static segments beat [param] segments beat [...catch-all].

import { NextRequest, toNextRequest } from "next/server";

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string | Array<string>>> },
) => Response | Promise<Response>;

type RouteModule = Partial<
  Record<
    "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD",
    RouteHandler
  >
>;

interface CompiledRoute {
  segments: Array<
    | { kind: "static"; value: string }
    | { kind: "param"; name: string }
    | { kind: "catchall"; name: string }
  >;
  score: number;
  load: () => Promise<RouteModule>;
}

const modules = import.meta.glob("/src/bff/**/route.ts") as Record<
  string,
  () => Promise<RouteModule>
>;

const routes: Array<CompiledRoute> = Object.entries(modules).map(
  ([file, load]) => {
    const rel = file.replace(/^\/src\/bff\//, "").replace(/\/route\.ts$/, "");
    const segments = (rel === "route.ts" ? [] : rel.split("/")).map((seg) => {
      const catchall = seg.match(/^\[\.\.\.(.+)\]$/);
      if (catchall) return { kind: "catchall" as const, name: catchall[1]! };
      const param = seg.match(/^\[(.+)\]$/);
      if (param) return { kind: "param" as const, name: param[1]! };
      return { kind: "static" as const, value: seg };
    });
    const score = segments.reduce(
      (acc, seg) =>
        acc + (seg.kind === "static" ? 3 : seg.kind === "param" ? 1 : 0),
      0,
    );
    return { segments, score, load };
  },
);

routes.sort(
  (a, b) => b.score - a.score || b.segments.length - a.segments.length,
);

function matchRoute(
  pathSegments: Array<string>,
): {
  route: CompiledRoute;
  params: Record<string, string | Array<string>>;
} | null {
  outer: for (const route of routes) {
    const params: Record<string, string | Array<string>> = {};
    const hasCatchall =
      route.segments[route.segments.length - 1]?.kind === "catchall";
    if (
      hasCatchall
        ? pathSegments.length < route.segments.length
        : pathSegments.length !== route.segments.length
    ) {
      continue;
    }
    for (let i = 0; i < route.segments.length; i++) {
      const seg = route.segments[i]!;
      const value = pathSegments[i]!;
      if (seg.kind === "static") {
        if (seg.value !== value) continue outer;
      } else if (seg.kind === "param") {
        params[seg.name] = decodeURIComponent(value);
      } else {
        params[seg.name] = pathSegments
          .slice(i)
          .map((s) => decodeURIComponent(s));
        return { route, params };
      }
    }
    return { route, params };
  }
  return null;
}

export async function dispatchBff(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathSegments = url.pathname
    .replace(/^\/api\/?/, "")
    .split("/")
    .filter(Boolean);

  const matched = matchRoute(pathSegments);
  if (!matched) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  const mod = await matched.route.load();
  const method = request.method.toUpperCase() as keyof RouteModule;
  const handler = mod[method] ?? (method === "HEAD" ? mod.GET : undefined);
  if (!handler) {
    const allowed = Object.keys(mod).filter((key) =>
      ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].includes(
        key,
      ),
    );
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: allowed.join(", ") },
    });
  }

  return handler(toNextRequest(request), {
    params: Promise.resolve(matched.params),
  });
}
