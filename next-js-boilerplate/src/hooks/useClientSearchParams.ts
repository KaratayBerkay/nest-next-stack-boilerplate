"use client";

import { useEffect, useState } from "react";

export function useClientSearchParams(): URLSearchParams | null {
  const [sp, setSp] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSp(new URLSearchParams(window.location.search));
  }, []);
  return sp;
}
