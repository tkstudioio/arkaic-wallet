import { create } from "zustand";

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
import { filter, find } from "lodash";

type ProfileStore = {
  profile?: ArkaicProfile;
  arkProvider?: ArkProvider;
  indexerProvider?: IndexerProvider;
  vtxoManager?: VtxoManager;
  wallet?: Wallet;
  login: (profileName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  removeProfile: (profileName: string) => Promise<void>;
};

export enum StorageKeys {
  Profiles = "profiles",
}

const useProfileStore = create<ProfileStore>((set) => ({
  logout: async () => {
    set({
      profile: undefined,
      arkProvider: undefined,
      indexerProvider: undefined,
      wallet: undefined,
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
  login: async (profileName: string) => {
    const storedProfiles = await AsyncStorage.getItem(StorageKeys.Profiles);
    const currentProfiles = storedProfiles
      ? (JSON.parse(storedProfiles) as ArkaicProfile[])
      : [];

    const profile = find(
      currentProfiles,
      (profile) => profile.name === profileName
    );

    if (!profile) return false;

    const arkProvider = new ExpoArkProvider(profile.arkadeServerUrl);
    const indexerProvider = new ExpoIndexerProvider(profile.arkadeServerUrl);

    const identity = SingleKey.fromHex(profile.privateKey);
    const wallet = await Wallet.create({
      identity,
      arkProvider,
      indexerProvider,
    });

    const vtxoManager = new VtxoManager(wallet, {
      enabled: true,
      thresholdPercentage: 10,
    });

    set({ wallet, arkProvider, indexerProvider, profile, vtxoManager });

    return true;
  },
}));

export default useProfileStore;
