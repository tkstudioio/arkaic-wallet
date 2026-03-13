import { backend } from "@/lib/api";
import { Chat } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useSellerChats(listingId: number) {
  return useQuery({
    queryKey: ["seller-chats", listingId],
    queryFn: async () => {
      const { data } = await backend.get<Chat[]>("/chats/seller/" + listingId);
      return data;
    },
  });
}
