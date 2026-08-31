import { apiFetchJson } from "@/lib/api-client";
import { DATA_URL } from "@/constants/api/urls";

export type ApiData = {
  id: number;
  name: string;
  nested: { value: number };
};

export async function getDataServer(): Promise<ApiData> {
  return apiFetchJson<ApiData>(DATA_URL);
}
