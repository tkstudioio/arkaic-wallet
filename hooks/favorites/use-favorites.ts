import { backend } from "@/lib/api";
import { Favorite } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async (): Promise<Favorite[]> => {
      const { data } = await backend.get<{ favorites: Favorite[]; total: number }>("/favorites");
      return data.favorites;
    },
  });
}
