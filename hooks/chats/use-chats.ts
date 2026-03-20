import { backend } from "@/lib/api";
import { Chat } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useChats() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async (): Promise<Chat[]> => {
      const { data } = await backend.get<{ chats: Chat[]; total: number }>("/chats");
      return data.chats;
    },
  });
}
