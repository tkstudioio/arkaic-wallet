import { useFavorites } from "@/hooks/favorites/use-favorites";

export function useIsFavorite(listingId: number): {
  isFavorite: boolean;
  isLoading: boolean;
} {
  const { data, isLoading } = useFavorites();

  const isFavorite = data?.some((fav) => fav.listingId === listingId) ?? false;

  return { isFavorite, isLoading };
}
