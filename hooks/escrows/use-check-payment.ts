import { backend } from "@/lib/api";
import { Escrow } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useCheckPayment(escrowAddress: string) {
  return useQuery({
    queryKey: ["check-payment", escrowAddress],
    queryFn: async (): Promise<Escrow> => {
      const { data } = await backend.get<Escrow>(
        `/escrows/address/${escrowAddress}/check-payment`,
      );
      return data;
    },
  });
}
