import { backend } from "@/lib/api";
import { Listing } from "@/types/backend";

import { useQuery } from "@tanstack/react-query";

export function useListing(id: number | string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async (): Promise<Listing> => {
      const { data } = await backend.get(`/listings/${id}`);

      return data;
    },
    refetchInterval: 1000 * 15,
  });
}
