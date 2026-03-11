import { useMutation } from "@tanstack/react-query";

// TODO: Refactored in task 06 — escrow flow
export function useBuyProduct() {
  return useMutation({
    mutationKey: ["buy-product"],
    mutationFn: async () => {
      throw new Error("Not implemented — see task 06");
    },
  });
}
