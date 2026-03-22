import { backend } from "@/lib/api";
import { CreateListingAttribute, Listing } from "@/types/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

type UpdateProductParams = {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  attributes: CreateListingAttribute[];
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-product"],
    mutationFn: async ({ id, ...values }: UpdateProductParams): Promise<Listing> => {
      const { data } = await backend.patch(`/listings/${id}`, values);
      return data;
    },
    onError: (err: Error) => {
      if (isAxiosError(err)) console.error(err.response?.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listing", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["listing", String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
