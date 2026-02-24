import { ArkaicAccount } from "@/types/arkaic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const storedAccounts = await AsyncStorage.getItem("accounts");
      const currentAccounts = storedAccounts ? JSON.parse(storedAccounts) : [];

      return currentAccounts as ArkaicAccount[];
    },

    refetchOnMount: true,
  });
}
