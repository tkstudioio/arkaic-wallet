import { backend } from "@/lib/api";
import { Favorite } from "@/types/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ToggleFavoriteParams = {
  listingId: number;
  isFavorite: boolean;
};

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isFavorite }: ToggleFavoriteParams) => {
      if (isFavorite) {
        await backend.delete(`/favorites/${listingId}`);
        return null;
      } else {
        const { data } = await backend.post<Favorite>(`/favorites/${listingId}`, {});
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
