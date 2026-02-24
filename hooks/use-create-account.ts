import useAccountStore, { StorageKeys } from "@/stores/account";
import { ArkaicAccount } from "@/types/arkaic";
import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import { SingleKey, VtxoManager, Wallet } from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateAccountParams = {
  account: ArkaicAccount;
  privateKey: string;
};

export function useCreateAccount() {
  const { setStore } = useAccountStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-account"],
    mutationFn: async ({ account, privateKey }: CreateAccountParams) => {
      const storedAccounts = await AsyncStorage.getItem(StorageKeys.Accounts);
      const currentAccounts = storedAccounts ? JSON.parse(storedAccounts) : [];

      await AsyncStorage.setItem(
        StorageKeys.Accounts,
        JSON.stringify([...currentAccounts, account]),
      );

      queryClient.invalidateQueries({ queryKey: ["accounts"] });

      const arkProvider = new ExpoArkProvider(account.arkadeServerUrl);
      const indexerProvider = new ExpoIndexerProvider(account.arkadeServerUrl);

      const identity = SingleKey.fromHex(privateKey);
      const wallet = await Wallet.create({
        identity,
        arkProvider,
        indexerProvider,
      });

      const swapProvider = new BoltzSwapProvider({
        apiUrl: "https://api.ark.boltz.exchange",
        network: "bitcoin",
      });

      const arkadeLightning = new ArkadeLightning({
        // @ts-expect-error some strange type error.
        wallet,
        swapProvider,
      });

      const vtxoManager = new VtxoManager(wallet, {
        enabled: true,
        thresholdPercentage: 10,
      });

      setStore({
        account: { ...account, privateKey },
        wallet,
        arkProvider,
        indexerProvider,
        vtxoManager,
        arkadeLightning,
      });

      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
