import { useQuery } from "@tanstack/react-query";

export interface EchoResponse {
  method: string;
  hello: string;
}

async function fetchEcho(name: string): Promise<EchoResponse> {
  const res = await fetch(`/api/echo?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  return res.json() as Promise<EchoResponse>;
}

export function useEcho(name: string) {
  return useQuery({
    queryKey: ["echo", name],
    queryFn: () => fetchEcho(name),
  });
}
