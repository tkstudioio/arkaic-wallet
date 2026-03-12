import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { ChatMessage } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AcceptOfferMessageParams = {
  chatId: number;
  messageId: number;
};

export function useAcceptOfferMessage() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["accept-offer-message"],
    mutationFn: async ({
      chatId,
      messageId,
    }: AcceptOfferMessageParams): Promise<ChatMessage> => {
      if (!wallet) throw new Error("Missing wallet");

      const { data } = await backend.post(
        `/chats/${chatId}/offers/${messageId}/accept`,
      );

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.chatId],
      });
    },
  });
}
