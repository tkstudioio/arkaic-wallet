import { useMutation } from "@tanstack/react-query";

// TODO: Refactored in task 06 — escrow collaborate
export function useSellerSignCollaborate() {
  return useMutation({
    mutationKey: ["seller-sign-collaborate"],
    mutationFn: async () => {
      throw new Error("Not implemented — see task 06");
    },
  });
}
