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
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["create-product"],
    mutationFn: async (values: CreateProductParams): Promise<Product> => {
      console.log(values);
      if (!wallet) throw new Error("Missing wallet");

      const { data } = await backend.post(`/products`, values);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
