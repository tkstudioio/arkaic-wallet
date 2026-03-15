import { backend } from "@/lib/api";
import { Escrow } from "@/types/backend";

import { useQuery } from "@tanstack/react-query";

export function useChatEscrow(chatId: number) {
  return useQuery({
    queryKey: ["chat-escrow", chatId],
    queryFn: async (): Promise<Escrow | null> => {
      const { data } = await backend.get<Escrow | null>(
        "/chats/" + chatId + "/escrow",
      );
      return data;
    },
  });
}
