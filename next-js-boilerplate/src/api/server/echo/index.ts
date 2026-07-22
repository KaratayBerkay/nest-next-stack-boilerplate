import { apiFetchJson } from "@/lib/api-client";
import { ECHO_URL } from "@/constants/api/urls";

export interface EchoResponse {
  method: string;
  hello: string;
}

export async function echoServer(name: string): Promise<EchoResponse> {
  return apiFetchJson<EchoResponse>(`${ECHO_URL}?name=${encodeURIComponent(name)}`);
}
