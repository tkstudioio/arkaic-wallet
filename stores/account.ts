import { create } from "zustand";

import { ArkadeLightning } from "@arkade-os/boltz-swap";
import {
  ArkProvider,
  IndexerProvider,
  VtxoManager,
  Wallet,
} from "@arkade-os/sdk";

import { ArkaicAccount } from "@/types/arkaic";
import AsyncStorage from "@react-native-async-storage/async-storage";
type AccountStore = {
  arkadeLightning?: ArkadeLightning;
  arkProvider?: ArkProvider;
  indexerProvider?: IndexerProvider;
  vtxoManager?: VtxoManager;
  wallet?: Wallet;
  showTransactionsList: boolean;
  setShowTransactionsList: (showTransactionsList: boolean) => void;
  logout: () => void;
  setStore: (
    storeValues: Partial<
      Omit<
        AccountStore,
        "setStore" | "logout" | "setShowTransactionsList"
      >
    >,
  ) => void;
  account?: ArkaicAccount;
};

export enum StorageKeys {
  Accounts = "accounts",
}

async function migrateProfilesToAccounts() {
  const oldData = await AsyncStorage.getItem("profiles");
  if (oldData) {
    await AsyncStorage.setItem(StorageKeys.Accounts, oldData);
    await AsyncStorage.removeItem("profiles");
  }
}

migrateProfilesToAccounts();

const useAccountStore = create<AccountStore>((set) => ({
  showTransactionsList: true,
  setShowTransactionsList: (showTransactionsList) => {
    set({
      showTransactionsList,
    });
  },
  logout: () => {
    set({
      wallet: undefined,
      arkProvider: undefined,
      indexerProvider: undefined,
      vtxoManager: undefined,
      arkadeLightning: undefined,
      account: undefined,
    });
  },

  setStore: async (account) => {
    set(account);
  },
}));

export default useAccountStore;
