import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
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
    mutationFn: async ({
      productId,
      text,
      offerPrice,
    }: OpenChatParams): Promise<ProductChat> => {
      if (!wallet) throw new Error("Missing wallet");

      const response = await backend.post(`/products/${productId}/chats`, {
        text,
        offerPrice,
      });

      return response.data;
    },
    onError: console.log,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product-chats", variables.productId],
      });
    },
  });
}
