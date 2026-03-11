import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// TODO: replace with actual API base URL
const API_BASE_URL = "http://localhost:4000";

type CreateProductParams = {
  nome: string;
  prezzo: number;
};

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["create-product"],
    mutationFn: async (params: CreateProductParams): Promise<Product> => {
      if (!wallet) throw new Error("Missing wallet");

      const pubkey = await getPubkeyHex(wallet);

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pubkey}`,
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
