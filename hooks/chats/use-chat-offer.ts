import { backend } from "@/lib/api";
import { Offer } from "@/types/backend";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useChatOffer(chatId: number) {
  return useQuery({
    queryKey: ["chat-offer", chatId],
    queryFn: async (): Promise<Offer | null> => {
      try {
        const { data } = await backend.get<Offer>(`/chats/${chatId}/offer`);
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(chatId),
  });
}
