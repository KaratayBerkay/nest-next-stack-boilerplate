import { useMutation } from "@tanstack/react-query";
import { claimBundleServer } from "@/api/server/e2ee/claim-bundle";

export function useClaimBundle() {
  return useMutation({
    mutationFn: (targetUserId: string) => claimBundleServer(targetUserId),
  });
}
