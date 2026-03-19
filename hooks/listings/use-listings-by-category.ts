import { backend } from "@/lib/api";
import { Listing } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useListingsByCategory(
  categoryId: number | undefined,
  params?: Record<string, string | number | boolean | number[]>
) {
  return useQuery({
    queryKey: ["listings", categoryId, params],
    queryFn: async (): Promise<Listing[]> => {
      const queryParams = new URLSearchParams();

      if (categoryId) {
        queryParams.append("categoryId", String(categoryId));
        queryParams.append("includeChildren", "true");
      }

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            if (Array.isArray(value)) {
              // For multi_select, add multiple params with same key
              value.forEach((v) => queryParams.append(key, String(v)));
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }

      const { data } = await backend.get(
        `/listings?${queryParams.toString()}`
      );

      return data.listings;
    },
    staleTime: 1000 * 60,
    enabled: !!categoryId,
  });
}
