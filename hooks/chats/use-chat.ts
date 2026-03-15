import { backend } from "@/lib/api";
import { Chat } from "@/types/backend";

import { useQuery } from "@tanstack/react-query";

export function useChat(chatId: number) {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async (): Promise<Chat | null> => {
      const { data } = await backend.get<Chat | null>(`/chats/${chatId}`);
      return data;
    },
    enabled: Boolean(chatId),
  });
}
