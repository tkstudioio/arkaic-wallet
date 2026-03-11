import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Escrow } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCheckPayment() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["check-payment"],
    mutationFn: async (escrowId: number): Promise<Escrow> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/check-payment`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to check payment");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["escrow", data.id] });
      queryClient.invalidateQueries({ queryKey: ["chat", data.chatId] });
    },
  });
}
