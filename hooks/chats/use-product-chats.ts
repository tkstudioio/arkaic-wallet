import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { ProductChat } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useProductChats(productId: number | string) {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["product-chats", productId],
    queryFn: async (): Promise<ProductChat[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const { data } = await backend.get(`/products/${productId}/chats`);

      console.log(data);
      return data;
    },
    enabled: !!productId && !!wallet,
  });
}
