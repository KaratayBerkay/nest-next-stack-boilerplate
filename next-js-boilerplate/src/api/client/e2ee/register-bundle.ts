import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerBundleServer } from "@/api/server/e2ee/register-bundle";
import type { RegisterBundlePayload } from "@/api/server/e2ee/register-bundle";

export function useRegisterBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterBundlePayload) =>
      registerBundleServer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["e2ee", "bundle-status"] });
    },
  });
}
