import useProfileStore from "@/stores/profile";
import { ArkaicProfile } from "@/types/arkaic";
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
  profile: ArkaicProfile;
  passphrase?: string;
};

export function useLoginMutation() {
  const { setStore } = useProfileStore();
  const router = useRouter();

  return useMutation({
    mutationKey: ["setAccount"],
    mutationFn: async ({ profile, passphrase }: LoginParams) => {
      let privateKey = profile.privateKey;

      if (profile.mnemonic) {
        privateKey = mnemonicToPrivateKey(profile.mnemonic, passphrase);
      }

      if (!privateKey) {
        throw new Error("No private key or mnemonic available");
      }

      const arkProvider = new ExpoArkProvider(profile.arkadeServerUrl);
      const indexerProvider = new ExpoIndexerProvider(profile.arkadeServerUrl);

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
        profile: { ...profile, privateKey },
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
