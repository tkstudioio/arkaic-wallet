import { backend } from "@/lib/api";
import { Category } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["categories", slug],
    queryFn: async (): Promise<Category> => {
      const { data } = await backend.get(`/categories/${slug}`);
      return data;
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!slug,
  });
}
