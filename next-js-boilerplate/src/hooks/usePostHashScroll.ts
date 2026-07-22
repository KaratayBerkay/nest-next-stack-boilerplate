"use client";

import { useEffect } from "react";

export function usePostHashScroll() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  useEffect(() => {
    if (!hash.startsWith("#post-")) return;
    const id = hash.replace("#post-", "");
    let timer: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const tryScroll = () => {
      const el = document.getElementById(`post-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      }
      return false;
    };
    if (!tryScroll()) {
      timer = setInterval(() => {
        if (tryScroll()) {
          if (timer) clearInterval(timer);
          if (timeout) clearTimeout(timeout);
        }
      }, 200);
      timeout = setTimeout(() => {
        if (timer) clearInterval(timer);
      }, 5000);
      return () => {
        if (timer) clearInterval(timer);
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [hash]);
}
