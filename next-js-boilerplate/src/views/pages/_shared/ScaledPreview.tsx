"use client";

import { useEffect, useRef, useState } from "react";
import type { ScaledPreviewProps } from "@/types/pages/TemplateBrowser-types";

// Virtual desktop viewport a template is laid out in before being scaled
// down into the card frame. 16/10 frame → 800px of virtual height visible.
const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 800;

export function ScaledPreview({ children }: ScaledPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    // ResizeObserver delivers the initial size right after observe(), so the
    // first measurement arrives without a synchronous setState here.
    const observer = new ResizeObserver(() => {
      setScale(frame.clientWidth / VIRTUAL_WIDTH);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      aria-hidden
      className="bg-bg pointer-events-none relative aspect-[16/10] w-full overflow-hidden select-none"
    >
      {scale !== null && (
        <div
          inert
          className="absolute top-0 left-0 origin-top-left overflow-hidden"
          style={{
            width: VIRTUAL_WIDTH,
            height: VIRTUAL_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
