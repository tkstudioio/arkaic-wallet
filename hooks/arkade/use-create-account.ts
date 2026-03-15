import { backend } from "@/lib/api";
import useAccountStore, { StorageKeys } from "@/stores/account";
import { ArkaicAccount } from "@/types/arkaic";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import { SingleKey, VtxoManager, Wallet } from "@arkade-os/sdk";
import { schnorr } from "@noble/curves/secp256k1";

import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hex } from "@scure/base";
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

      const arkProvider = new ExpoArkProvider("https://mutinynet.arkade.sh");
      const indexerProvider = new ExpoIndexerProvider(
        "https://mutinynet.arkade.sh",
      );

      const identity = SingleKey.fromHex(privateKey);
      const wallet = await Wallet.create({
        identity,
        arkProvider,
        indexerProvider,
      });
      const pubkey = await getPubkeyHex(wallet);

      const registerMessage = new TextEncoder().encode(
        `${account.name} ${pubkey}`,
      );

      await backend.post("/auth/register", {
        pubkey,
        username: account.name,
        signature: hex.encode(
          schnorr.sign(registerMessage, hex.decode(privateKey)),
        ),
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
      });

      const { data: challenge } = await backend.post<{
        nonce: string;
        pubkey: string;
        expiry: Date;
      }>("/auth/challenge", { pubkey });

      const loginMessage = new TextEncoder().encode(
        `${challenge.nonce} ${pubkey}`,
      );

      const { data: token } = await backend.post<string>("/auth/login", {
        pubkey,
        nonce: challenge.nonce,
        signature: hex.encode(
          schnorr.sign(loginMessage, hex.decode(privateKey)),
        ),
      });

      setStore({
        account: account,
        pubkey,
        token,
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

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
    onError: (err: Error) => console.error(err.message),
  });
}
