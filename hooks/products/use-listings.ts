import { backend } from "@/lib/api";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useListings() {
  return useQuery({
    queryKey: ["listings"],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await backend.get("/listings");

      return data;
    },
  });
}
