import { backend } from "@/lib/api";
import { Category } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await backend.get("/categories");
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
