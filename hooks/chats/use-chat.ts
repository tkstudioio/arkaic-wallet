import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { ProductChat } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useChat(chatId: number) {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async (): Promise<ProductChat> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch chat");
      return response.json();
    },
    refetchInterval: 5000,
    enabled: !!chatId && !!wallet,
  });
}
