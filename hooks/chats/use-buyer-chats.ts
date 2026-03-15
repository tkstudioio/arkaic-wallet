import { backend } from "@/lib/api";
import { Chat } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useBuyerChats() {
  return useQuery({
    queryKey: ["buyer-chats"],
    queryFn: async (): Promise<Chat[]> => {
      const { data } = await backend.get<Chat[]>("/chats");
      return data;
    },
  });
}
