import { backend } from "@/lib/api";
import { OfferAcceptance } from "@/types/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type RespondToOfferParams = {
  chatId: number;
  offerId: number;
  accepted: boolean;
};

export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["respond-to-offer"],
    mutationFn: async ({
      chatId,
      offerId,
      accepted,
    }: RespondToOfferParams): Promise<OfferAcceptance> => {
      const { data } = await backend.post<OfferAcceptance>(
        `/messages/${chatId}/offers/${offerId}/respond`,
        { accepted },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["active-offer", variables.chatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.chatId],
      });
    },
  });
}
