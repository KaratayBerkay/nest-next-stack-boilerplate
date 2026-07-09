import { apiFetch } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { ECHO_URL } from "@/constants/api/urls";

interface EchoResponse {
  method: string;
  hello: string;
}

async function fetchEcho(name: string): Promise<EchoResponse> {
  const res = await apiFetch(`${ECHO_URL}?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  return res.json() as Promise<EchoResponse>;
}

export function useEcho(name: string) {
  return useQuery({
    queryKey: ["echo", name],
    queryFn: () => fetchEcho(name),
  });
}
