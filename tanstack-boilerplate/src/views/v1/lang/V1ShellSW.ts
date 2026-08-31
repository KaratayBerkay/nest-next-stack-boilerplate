import type { useRouter } from "next/navigation";
import { handleServiceWorkerMessage } from "@/lib/v1/touch-handlers";

export function onServiceWorkerMessage(
  e: MessageEvent,
  router: ReturnType<typeof useRouter>,
) {
  handleServiceWorkerMessage(e, router);
}
