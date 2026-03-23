import { backend } from "@/lib/api";
import { Offer } from "@/types/backend";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useChatOffer(chatId: number) {
  return useQuery({
    queryKey: ["chat-offer", chatId],
    queryFn: async (): Promise<Offer | null> => {
      // 404 means no active offer exists -- return null as a valid data state
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
