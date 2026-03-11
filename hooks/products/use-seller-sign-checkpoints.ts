import { useMutation } from "@tanstack/react-query";

// TODO: Refactored in task 06
export function useSellerSignCheckpoints() {
  return useMutation({
    mutationKey: ["seller-sign-checkpoints"],
    mutationFn: async () => {
      throw new Error("Not implemented — see task 06");
    },
  });
}
