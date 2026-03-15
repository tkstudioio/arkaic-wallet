import { backend } from "@/lib/api";
import { Offer } from "@/types/backend";

import { useQuery } from "@tanstack/react-query";

export function useChatOffer(chatId: number) {
  return useQuery({
    queryKey: ["chat-offer", chatId],
    queryFn: async (): Promise<Offer | null> => {
      const { data } = await backend.get<Offer | null>(
        `/chats/${chatId}/offer`,
      );
      return data;
    },
    enabled: Boolean(chatId),
  });
}
