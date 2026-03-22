import { backend } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeletePhotoParams = {
  listingId: number;
  photoId: number;
};

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-photo"],
    mutationFn: async ({ listingId, photoId }: DeletePhotoParams) => {
      const { data } = await backend.delete(`/listings/${listingId}/photos/${photoId}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listing", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["listing", String(variables.listingId)] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
