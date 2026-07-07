"use client";

import { useEffect, useState } from "react";

export function DynamicGreeting() {
  const [name, setName] = useState("Guest");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)name=([^;]*)/);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(match ? decodeURIComponent(match[1]) : "Guest");
  }, []);

  return (
    <p className="text-muted text-sm" data-testid="ppr-greeting">
      Hello, {name}!
    </p>
  );
}
