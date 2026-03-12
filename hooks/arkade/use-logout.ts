import useAccountStore from "@/stores/account";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export function useLogout() {
  const { setStore } = useAccountStore();
  const router = useRouter();
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      setStore({});
    },
    onSuccess: () => {
      router.dismissTo("/");
    },
  });
}
