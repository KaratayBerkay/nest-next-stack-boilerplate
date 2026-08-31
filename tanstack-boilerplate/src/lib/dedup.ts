import { cache } from "react";

let uncachedCounter = 0;
let cachedCounter = 0;

export interface Item {
  id: string;
  callCount: number;
}

export async function fetchUncached(id: string): Promise<Item> {
  await new Promise((r) => setTimeout(r, 10));
  uncachedCounter++;
  return { id, callCount: uncachedCounter };
}

export const fetchCached = cache(async (id: string): Promise<Item> => {
  await new Promise((r) => setTimeout(r, 10));
  cachedCounter++;
  return { id, callCount: cachedCounter };
});
