import { useMutation } from "@tanstack/react-query";

// TODO: Refactored in task 06
export function useBuyerConfirmCollaborate() {
  return useMutation({
    mutationKey: ["buyer-confirm-collaborate"],
    mutationFn: async () => {
      throw new Error("Not implemented — see task 06");
    },
  });
}
