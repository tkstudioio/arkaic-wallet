import { backend } from "@/lib/api";

import { useMutation, useQueryClient } from "@tanstack/react-query";

type SendMessageParams = {
  chatId: number;
  message?: string;
  offeredPrice?: number;
};

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["send-message"],
    mutationFn: async ({
      chatId,
      offeredPrice,
      message,
    }: SendMessageParams): Promise<unknown> => {
      const { data } = await backend.post(`/messages/${chatId}`, {
        offeredPrice,
        message,
      });

      return data;
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.chatId],
      });
    },
  });
}
