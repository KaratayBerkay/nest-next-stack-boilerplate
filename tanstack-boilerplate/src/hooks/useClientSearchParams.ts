"use client";

import { useSearchParams } from "next/navigation";

export function useClientSearchParams(): URLSearchParams | null {
  return useSearchParams();
}
