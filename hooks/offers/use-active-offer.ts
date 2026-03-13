import { backend } from "@/lib/api";
import { Offer } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useActiveOffer(chatId: number) {
  return useQuery({
    queryKey: ["active-offer", chatId],
    queryFn: async (): Promise<Offer | null> => {
      try {
        const { data } = await backend.get<Offer>(
          `/messages/${chatId}/offers/active`,
        );
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}
