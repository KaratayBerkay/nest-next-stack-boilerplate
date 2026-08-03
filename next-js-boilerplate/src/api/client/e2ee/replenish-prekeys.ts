import { useMutation } from "@tanstack/react-query";
import { replenishPrekeysServer } from "@/api/server/e2ee/replenish-prekeys";

export function useReplenishPrekeys() {
  return useMutation({
    mutationFn: (oneTimePrekeys: Array<{ keyId: string; publicKey: string }>) =>
      replenishPrekeysServer(oneTimePrekeys),
  });
}
