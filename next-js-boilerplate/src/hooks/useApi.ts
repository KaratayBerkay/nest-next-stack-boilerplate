import { apiFetch } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

interface EchoResponse {
  method: string;
  hello: string;
}

async function fetchEcho(name: string): Promise<EchoResponse> {
  const res = await apiFetch(`/api/echo?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  return res.json() as Promise<EchoResponse>;
}

export function useEcho(name: string) {
  return useQuery({
    queryKey: ["echo", name],
    queryFn: () => fetchEcho(name),
  });
}
