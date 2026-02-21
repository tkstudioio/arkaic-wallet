import useProfileStore from "@/stores/profile";
import { ArkaicProfile } from "@/types/arkaic";
import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import { SingleKey, VtxoManager, Wallet } from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export function useLoginMutation() {
  const { setStore } = useProfileStore();
  const router = useRouter();

  return useMutation({
    mutationKey: ["setAccount"],
    mutationFn: async (profile: ArkaicProfile) => {
      const arkProvider = new ExpoArkProvider(profile.arkadeServerUrl);
      const indexerProvider = new ExpoIndexerProvider(profile.arkadeServerUrl);

      const identity = SingleKey.fromHex(profile.privateKey);
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
        profile,
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
