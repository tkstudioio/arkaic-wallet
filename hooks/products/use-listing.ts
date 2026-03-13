import { backend } from "@/lib/api";

import { useQuery } from "@tanstack/react-query";

export function useListing(id: number | string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async (): Promise<unknown> => {
      return await backend.get(`/listings/${id}`);
    },

    refetchInterval: 1000 * 15,
  });
}
