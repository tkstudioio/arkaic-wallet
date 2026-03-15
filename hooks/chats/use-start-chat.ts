import { backend } from "@/lib/api";
import { Chat, Listing } from "@/types/backend";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { isEmpty } from "lodash";
import { useSendMessage } from "../messages/use-send-message";

export function useStartChat() {
  const router = useRouter();
  const sendMessageMutation = useSendMessage();

  return useMutation({
    mutationKey: ["chat"],
    mutationFn: async (listing: Listing): Promise<Chat> => {
      const { data } = await backend.post<Chat>("/chats/" + listing.id);

      if (isEmpty(data.messages)) {
        await sendMessageMutation.mutateAsync({
          chatId: data.id,
          message: "Is the product still available?",
        });
      }

      return data;
    },
    onError: (err: Error) => console.error(err.message),
    onSuccess: (data) => router.push(`/chats/${data.id}`),
  });
}
