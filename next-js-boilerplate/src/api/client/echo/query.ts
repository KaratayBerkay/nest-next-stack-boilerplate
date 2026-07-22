import { queryOptions } from "@tanstack/react-query";

export function echoQueryOptions(name: string) {
  return queryOptions({
    queryKey: ["echo", name],
    queryFn: async () => {
      const { echoServer } = await import("@/api/server/echo");
      return echoServer(name);
    },
  });
}
