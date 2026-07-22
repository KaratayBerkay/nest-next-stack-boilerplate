import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { formOptions } from "@tanstack/react-form";
import { exceptionHandler, getSurface } from "@/lib/exception-handler";
import { useApiKeyActions } from "@/api/client/api-keys/actions";
import type { ApiKeyInfo } from "@/api/server/api-keys/list";
import type { I18nMessages } from "@/generated/i18n-messages";

interface UseApiKeyMutationsOptions {
  onCreated?: (fullKey: string) => void;
}

export function useApiKeyMutations(
  t: I18nMessages["forms"],
  options?: UseApiKeyMutationsOptions,
) {
  const messages = useAllMessages();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createApiKey, revokeApiKey } = useApiKeyActions();

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      expiresIn: string;
      permissions: string[];
    }) => {
      const expiresInDays =
        data.expiresIn === "never" ? null : Number(data.expiresIn);
      return createApiKey(data.name, expiresInDays);
    },
    onSuccess: (result) => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["api-keys", "list"] });
      options?.onCreated?.(result.fullKey);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await revokeApiKey(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["api-keys", "list"] });
      const previous = queryClient.getQueryData<ApiKeyInfo[]>([
        "api-keys",
        "list",
      ]);
      queryClient.setQueryData<ApiKeyInfo[]>(["api-keys", "list"], (old) =>
        old?.filter((k) => k.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous)
        queryClient.setQueryData(["api-keys", "list"], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", "list"] });
    },
  });

  const form = useAppForm({
    ...formOptions({
      defaultValues: {
        name: "",
        expiresIn: "30",
        permissions: [] as string[],
      },
      validators: {
        onSubmitAsync: async ({ value }) => {
          try {
            await createMutation.mutateAsync(value);
            return null;
          } catch (err) {
            const exc = (
              err as { exception?: { exc: string; key: string; msg: string } }
            ).exception;
            if (!exc) return { form: t.errors.unknown, fields: {} };
            const surface = getSurface(exc.exc);
            if (surface === "toast") {
              toast({
                description: exceptionHandler(exc, messages),
                variant: "destructive",
              });
              return null;
            }
            return { form: exceptionHandler(exc, messages), fields: {} };
          }
        },
      },
    }),
  });

  return { createMutation, revokeMutation, form };
}
