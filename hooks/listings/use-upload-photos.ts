import { backend } from "@/lib/api";
import { ListingPhoto } from "@/types/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UploadPhotosParams = {
  listingId: number;
  uris: string[];
};

export function useUploadPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["upload-photos"],
    mutationFn: async ({ listingId, uris }: UploadPhotosParams): Promise<ListingPhoto[]> => {
      const formData = new FormData();

      for (const uri of uris) {
        const filename = uri.split("/").pop() ?? `photo_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1] === "jpg" ? "jpeg" : match[1]}` : "image/jpeg";

        formData.append("photos", {
          uri,
          name: filename,
          type: mimeType,
        } as unknown as Blob);
      }

      const { data } = await backend.post(
        `/listings/${listingId}/photos`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

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
