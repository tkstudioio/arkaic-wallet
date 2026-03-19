import { backend } from "@/lib/api";
import { CategoryAttribute } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useCategoryAttributes(categoryId: number | undefined) {
  return useQuery({
    queryKey: ["categories", categoryId, "attributes"],
    queryFn: async (): Promise<CategoryAttribute[]> => {
      const { data } = await backend.get(
        `/attributes/by-category/${categoryId}`,
      );
      return data;
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!categoryId,
  });
}
