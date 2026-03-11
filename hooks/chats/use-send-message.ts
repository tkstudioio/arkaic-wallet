import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { ChatMessage } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type SendMessageParams = {
  chatId: number;
  text?: string;
  offerPrice?: number;
};

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["send-message"],
    mutationFn: async (params: SendMessageParams): Promise<ChatMessage> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const body: Record<string, unknown> = {};
      if (params.text) body.text = params.text;
      if (params.offerPrice !== undefined) body.offerPrice = params.offerPrice;

      const response = await fetch(
        `${API_BASE_URL}/chats/${params.chatId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(body),
        },
      );
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.chatId],
      });
    },
  });
}
