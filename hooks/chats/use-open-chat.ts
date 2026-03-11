import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { ProductChat } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type OpenChatParams = {
  productId: number;
  text?: string;
  offerPrice?: number;
};

export function useOpenChat() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["open-chat"],
    mutationFn: async (params: OpenChatParams): Promise<ProductChat> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const body: Record<string, unknown> = {};
      if (params.text) body.text = params.text;
      if (params.offerPrice !== undefined) body.offerPrice = params.offerPrice;

      const response = await fetch(
        `${API_BASE_URL}/products/${params.productId}/chats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(body),
        },
      );
      if (!response.ok) throw new Error("Failed to open chat");
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product-chats", variables.productId],
      });
    },
  });
}
