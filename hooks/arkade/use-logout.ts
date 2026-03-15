import useAccountStore from "@/stores/account";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export function useLogout() {
  const { logout } = useAccountStore();
  const router = useRouter();
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      logout();
    },
    onSuccess: () => {
      router.dismissTo("/");
    },
  });
}
