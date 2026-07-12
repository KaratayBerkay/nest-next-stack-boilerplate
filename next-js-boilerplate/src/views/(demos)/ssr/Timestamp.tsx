"use client";

import { useEffect, useState } from "react";

export function Timestamp() {
  const [ts, setTs] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTs(new Date().toISOString());
  }, []);

  return (
    <span className="font-mono" data-testid="ssr-timestamp">
      {ts}
    </span>
  );
}
