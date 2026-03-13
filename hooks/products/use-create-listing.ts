import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";

import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateProductParams = {
  name: string;
  price: number;
};

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { wallet, account } = useAccountStore();

  return useMutation({
    mutationKey: ["create-product"],
    mutationFn: async (values: CreateProductParams): Promise<Product> => {
      if (!wallet || !account?.privateKey) throw new Error("Missing account");

      const { data } = await backend.post(`/listings`, values);

      return data;
    },
    onError: console.log,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
