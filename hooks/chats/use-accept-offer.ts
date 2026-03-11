import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Escrow } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AcceptOfferParams = {
  chatId: number;
  timelockExpiry: number;
};

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["accept-offer"],
    mutationFn: async (params: AcceptOfferParams): Promise<Escrow> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(
        `${API_BASE_URL}/chats/${params.chatId}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ timelockExpiry: params.timelockExpiry }),
        },
      );
      if (!response.ok) throw new Error("Failed to accept offer");
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.chatId],
      });
    },
  });
}
