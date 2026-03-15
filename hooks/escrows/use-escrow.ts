import { backend } from "@/lib/api";
import { Escrow } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useEscrow(escrowAddress: string | undefined) {
  return useQuery({
    queryKey: ["escrow", escrowAddress],
    queryFn: async (): Promise<Escrow> => {
      const { data } = await backend.get(`/escrows/address/${escrowAddress}`);
      return data;
    },
    enabled: Boolean(escrowAddress),
    refetchInterval: 10000,
  });
}
