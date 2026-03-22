import { backend } from "@/lib/api";
import { ListingPhoto } from "@/types/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ReorderPhotosParams = {
  listingId: number;
  photoIds: number[];
};

export function useReorderPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["reorder-photos"],
    mutationFn: async ({ listingId, photoIds }: ReorderPhotosParams): Promise<ListingPhoto[]> => {
      const { data } = await backend.patch(
        `/listings/${listingId}/photos/order`,
        { photoIds }
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listing", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["listing", String(variables.listingId)] });
    },
  });
}
