import { create } from "zustand";

import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import {
  ArkProvider,
  IndexerProvider,
  SingleKey,
  VtxoManager,
  Wallet,
} from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";

import { ArkaicProfile } from "@/types/arkaic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { filter } from "lodash";

type ProfileStore = {
  arkadeLightning?: ArkadeLightning;
  arkProvider?: ArkProvider;
  indexerProvider?: IndexerProvider;
  vtxoManager?: VtxoManager;
  wallet?: Wallet;
  showTransactionsList: boolean;
  setShowTransactionsList: (showTransactionsList: boolean) => void;
  removeProfile: (profileName: string) => Promise<void>;
  setAccount: (account: ArkaicProfile) => void;
  account?: ArkaicProfile;
};

export enum StorageKeys {
  Profiles = "profiles",
}

const useProfileStore = create<ProfileStore>((set) => ({
  showTransactionsList: true,
  setShowTransactionsList: (showTransactionsList) => {
    set({
      showTransactionsList,
    });
  },
  removeProfile: async (profileName: string) => {
    const storedProfiles = await AsyncStorage.getItem(StorageKeys.Profiles);

    const currentProfiles = storedProfiles
      ? (JSON.parse(storedProfiles) as ArkaicProfile[])
      : [];

    const newStoredProfiles = filter(
      currentProfiles,
      (profile) => profile.name !== profileName
    );

    await AsyncStorage.setItem(
      StorageKeys.Profiles,
      JSON.stringify(newStoredProfiles)
    );
  },

  setAccount: async (account) => {
    const arkProvider = new ExpoArkProvider(account.arkadeServerUrl);
    const indexerProvider = new ExpoIndexerProvider(account.arkadeServerUrl);

    const identity = SingleKey.fromHex(account.privateKey);
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

    set({
      account,
      wallet,
      arkProvider,
      indexerProvider,
      vtxoManager,
      arkadeLightning,
    });
  },
}));

export default useProfileStore;
