import { backend } from "@/lib/api";
import { Listing } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useMyListings() {
  return useQuery({
    queryKey: ["listings"],
    queryFn: async (): Promise<Listing[]> => {
      const { data } = await backend.get("/listings/my-listings");

      return data;
    },
  });
}
