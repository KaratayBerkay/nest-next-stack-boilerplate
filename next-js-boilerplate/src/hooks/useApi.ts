import { useQuery } from "@tanstack/react-query";
import { echoQueryOptions } from "@/api/client/echo/query";

export function useEcho(name: string) {
  return useQuery(echoQueryOptions(name));
}
