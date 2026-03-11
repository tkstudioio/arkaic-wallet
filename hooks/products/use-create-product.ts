import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
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
    mutationFn: async (params: CreateProductParams): Promise<Product> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
