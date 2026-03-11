import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Escrow } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useEscrow(escrowId: number) {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["escrow", escrowId],
    queryFn: async (): Promise<Escrow> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to fetch escrow");
      return response.json();
    },
    refetchInterval: 10000,
    enabled: !!escrowId && !!wallet,
  });
}
