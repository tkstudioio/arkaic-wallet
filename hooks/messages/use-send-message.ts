import { backend } from "@/lib/api";
import { Message } from "@/types/backend";
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
    }: SendMessageParams): Promise<Message> => {
      const { data } = await backend.post<Message>(`/messages/${chatId}`, {
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
