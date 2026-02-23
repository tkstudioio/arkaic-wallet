import useProfileStore, { StorageKeys } from "@/stores/profile";
import { ArkaicProfile } from "@/types/arkaic";
import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import { SingleKey, VtxoManager, Wallet } from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateProfileParams = {
  profile: ArkaicProfile;
  privateKey: string;
};

export function useCreateProfile() {
  const { setStore } = useProfileStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-profile"],
    mutationFn: async ({ profile, privateKey }: CreateProfileParams) => {
      const storedProfiles = await AsyncStorage.getItem(StorageKeys.Profiles);
      const currentProfiles = storedProfiles ? JSON.parse(storedProfiles) : [];

      await AsyncStorage.setItem(
        StorageKeys.Profiles,
        JSON.stringify([...currentProfiles, profile]),
      );

      queryClient.invalidateQueries({ queryKey: ["profiles"] });

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

      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
