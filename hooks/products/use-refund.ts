import { useMutation } from "@tanstack/react-query";

// TODO: Refactored in task 06
export function useRefund() {
  return useMutation({
    mutationKey: ["refund"],
    mutationFn: async () => {
      throw new Error("Not implemented — see task 06");
    },
  });
}
