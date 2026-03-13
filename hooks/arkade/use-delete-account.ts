import useAccountStore, { StorageKeys } from "@/stores/account";
import { ArkaicAccount } from "@/types/arkaic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { filter } from "lodash";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setStore } = useAccountStore();
  return useMutation({
    mutationKey: ["delete-account"],
    mutationFn: async (accountName: string) => {
      const storedAccounts = await AsyncStorage.getItem(StorageKeys.Accounts);
      const currentAccounts = storedAccounts
        ? (JSON.parse(storedAccounts) as ArkaicAccount[])
        : [];

      const newStoredAccounts = filter(
        currentAccounts,
        (account) => account.name !== accountName,
      );

      await AsyncStorage.setItem(
        StorageKeys.Accounts,
        JSON.stringify(newStoredAccounts),
      );
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },

    onSuccess: () => {
      router.dismissTo("/");
      setStore({});
    },
  });
}
