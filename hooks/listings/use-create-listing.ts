import { backend } from "@/lib/api";
import { Listing } from "@/types/backend";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type CreateProductParams = {
  name: string;
  price: number;
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
    onError: console.log,
    onSuccess: () => {
      router.replace("/listings/my-listings");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
