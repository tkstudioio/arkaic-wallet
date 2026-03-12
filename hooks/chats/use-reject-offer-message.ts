import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { ChatMessage } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type RejectOfferMessageParams = {
  chatId: number;
  messageId: number;
};

export function useRejectOfferMessage() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["reject-offer-message"],
    mutationFn: async ({
      chatId,
      messageId,
    }: RejectOfferMessageParams): Promise<ChatMessage> => {
      if (!wallet) throw new Error("Missing wallet");

      const { data } = await backend.post(
        `/chats/${chatId}/offers/${messageId}/reject`,
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
