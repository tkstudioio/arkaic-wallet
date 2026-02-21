import { create } from "zustand";

import { ArkadeLightning } from "@arkade-os/boltz-swap";
import {
  ArkProvider,
  IndexerProvider,
  VtxoManager,
  Wallet,
} from "@arkade-os/sdk";

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
  setStore: (
    storeValues: Partial<
      Omit<
        ProfileStore,
        "setStore" | "removeProfile" | "setShowTransactionsList"
      >
    >,
  ) => void;
  profile?: ArkaicProfile;
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
      (profile) => profile.name !== profileName,
    );

    await AsyncStorage.setItem(
      StorageKeys.Profiles,
      JSON.stringify(newStoredProfiles),
    );
  },

  setStore: async (account) => {
    set(account);
  },
}));

export default useProfileStore;
