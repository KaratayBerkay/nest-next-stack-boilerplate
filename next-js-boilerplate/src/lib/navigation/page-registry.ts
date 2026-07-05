export type PageNode = {
  id: string;
  title: string;
  /** Route pattern using `:param` segments, e.g. `/v1/:lang/users/detail/:uuid` */
  pattern: string;
  backId?: string;
  forwardId?: string;
  enableSwipe?: boolean;
};

const PAGE_REGISTRY: PageNode[] = [
  {
    id: "home",
    title: "Home",
    pattern: "/v1/:lang",
  },
  {
    id: "users-list",
    title: "Users",
    pattern: "/v1/:lang/users/list",
    backId: "home",
    forwardId: "users-detail",
  },
  {
    id: "users-detail",
    title: "User Detail",
    pattern: "/v1/:lang/users/detail/:uuid",
    backId: "users-list",
    enableSwipe: true,
  },
];

const REGISTRY_MAP = new Map<string, PageNode>(
  PAGE_REGISTRY.map((n) => [n.id, n]),
);

export function getPageNode(id: string): PageNode | undefined {
  return REGISTRY_MAP.get(id);
}

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:[a-z]+/g, "([^/]+)");
  return new RegExp(`^${escaped}$`);
}

export function matchPage(pathname: string): PageNode | null {
  for (const node of PAGE_REGISTRY) {
    if (patternToRegex(node.pattern).test(pathname)) {
      return node;
    }
  }
  return null;
}

function resolvePath(
  pattern: string,
  params: Record<string, string>,
): string {
  return pattern.replace(/:([a-z]+)/g, (_, key) => params[key] ?? "");
}

export function buildPath(node: PageNode, currentPath: string): string | null {
  const current = matchPage(currentPath);
  if (!current) return null;

  const parts = current.pattern.split("/");
  const pathParts = currentPath.split("/");
  const params: Record<string, string> = {};

  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith(":")) {
      params[parts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    }
  }

  const targetParts = node.pattern.split("/");
  const result: string[] = [];

  for (const part of targetParts) {
    if (part.startsWith(":")) {
      const key = part.slice(1);
      if (params[key] !== undefined) {
        result.push(params[key]);
      } else {
        return null;
      }
    } else {
      result.push(part);
    }
  }

  return result.join("/");
}
