import type { useRouter } from "next/navigation";

export function handleTouchStart(e: TouchEvent, onStart: (x: number) => void) {
  if (!e.touches.length) return;
  onStart(e.touches[0].clientX);
}

export function handleTouchMove(e: TouchEvent, onMove: (x: number) => void) {
  if (!e.touches.length) return;
  onMove(e.touches[0].clientX);
}

export function handleTouchEnd(onEnd: () => void) {
  onEnd();
}

export function handleMouseDown(e: MouseEvent, onStart: (x: number) => void) {
  onStart(e.clientX);
}

export function handleMouseMove(e: MouseEvent, onMove: (x: number) => void) {
  onMove(e.clientX);
}

export function handleMouseUp(onEnd: () => void) {
  onEnd();
}

export function handleServiceWorkerMessage(
  e: MessageEvent,
  router: ReturnType<typeof useRouter>,
) {
  if (e.data?.type === "navigate" && e.data?.url) {
    router.push(e.data.url);
  }
}
