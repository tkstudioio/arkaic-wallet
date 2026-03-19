import { backend } from "@/lib/api";
import { CreateListingAttribute, Listing } from "@/types/backend";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";

type CreateProductParams = {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  attributes: CreateListingAttribute[];
};

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["create-product"],
    mutationFn: async (values: CreateProductParams): Promise<Listing> => {
      const { data } = await backend.post(`/listings`, values);
      return data;
    },
    onError: (err: Error) => { if (isAxiosError(err)) console.error(err.response?.data); },
    onSuccess: () => {
      router.replace("/listings/my-listings");
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
