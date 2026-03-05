import useAccountStore from "@/stores/account";
import { ArkaicAccount } from "@/types/arkaic";
import { mnemonicToPrivateKey } from "@/utils/mnemonic";
import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import { SingleKey, VtxoManager, Wallet } from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type LoginParams = {
  account: ArkaicAccount;
  passphrase?: string;
};

export function useLoginMutation() {
  const { setStore } = useAccountStore();
  const router = useRouter();

  return useMutation({
    mutationKey: ["setAccount"],
    mutationFn: async ({ account, passphrase }: LoginParams) => {
      let privateKey = account.privateKey;

      if (account.mnemonic) {
        privateKey = mnemonicToPrivateKey(account.mnemonic, passphrase);
      }

      if (!privateKey) {
        throw new Error("No private key or mnemonic available");
      }

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
      });

      setStore({
        account: { ...account, privateKey },
        wallet,
        arkProvider,
        indexerProvider,
        vtxoManager,
        arkadeLightning,
      });

      router.push("/dashboard");
    },
  });
}
