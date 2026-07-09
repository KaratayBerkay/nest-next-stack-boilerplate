export function routeToPageClaim(
  pathname: string | null,
  searchParams: URLSearchParams | null,
): { page: string | null; params?: Record<string, string> } {
  if (!pathname) return { page: null };
  const sp = searchParams ?? new URLSearchParams();
  const seg = pathname.split("/").filter(Boolean);
  const route = seg.slice(2).join("/");

  if (route === "messages" || route.startsWith("messages")) {
    const user = sp.get("user");
    if (user) return { page: "messages", params: { peer: user } };
    return { page: "messages" };
  }
  if (route === "find-friends") {
    return { page: "friend-request" };
  }
  if (route === "notification") {
    return { page: "notification" };
  }
  if (route === "feed") {
    return { page: "feed" };
  }
  if (route.startsWith("posts/")) {
    const uuid = route.split("/")[1];
    if (uuid) return { page: "post", params: { id: uuid } };
    return { page: "feed" };
  }
  if (route === "chat-room") {
    const room = sp.get("room") || "general";
    return { page: "chat-room", params: { room } };
  }
  return { page: null };
}
