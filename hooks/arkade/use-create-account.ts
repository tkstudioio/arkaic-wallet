import useAccountStore, { StorageKeys } from "@/stores/account";
import { ArkaicAccount } from "@/types/arkaic";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import { SingleKey, VtxoManager, Wallet } from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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

      const {
        data: { asp },
      } = await axios.get<{ asp: string }>("http://localhost:4000/config");

      queryClient.invalidateQueries({ queryKey: ["accounts"] });

      const arkProvider = new ExpoArkProvider(asp);
      const indexerProvider = new ExpoIndexerProvider(asp);

      const identity = SingleKey.fromHex(privateKey);
      const wallet = await Wallet.create({
        identity,
        arkProvider,
        indexerProvider,
      });

      const pubkey = await getPubkeyHex(wallet);

      await axios.post<{ asp: string }>(
        "http://localhost:4000/auth/create",
        { accountName: account.name },
        { headers: { Authorization: "Bearer " + pubkey } },
      );

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
      });

      setStore({
        account: { ...account, privateKey },
        wallet,
        arkProvider,
        indexerProvider,
        vtxoManager,
        arkadeLightning,
      });

      await AsyncStorage.setItem(
        StorageKeys.Accounts,
        JSON.stringify([...currentAccounts, account]),
      );

      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
