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
import { filter } from "lodash";

type AccountStore = {
  arkadeLightning?: ArkadeLightning;
  arkProvider?: ArkProvider;
  indexerProvider?: IndexerProvider;
  vtxoManager?: VtxoManager;
  wallet?: Wallet;
  showTransactionsList: boolean;
  setShowTransactionsList: (showTransactionsList: boolean) => void;
  removeAccount: (accountName: string) => Promise<void>;
  setStore: (
    storeValues: Partial<
      Omit<
        AccountStore,
        "setStore" | "removeAccount" | "setShowTransactionsList"
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
  removeAccount: async (accountName: string) => {
    const storedAccounts = await AsyncStorage.getItem(StorageKeys.Accounts);

    const currentAccounts = storedAccounts
      ? (JSON.parse(storedAccounts) as ArkaicAccount[])
      : [];

    const newStoredAccounts = filter(
      currentAccounts,
      (account) => account.name !== accountName,
    );

    await AsyncStorage.setItem(
      StorageKeys.Accounts,
      JSON.stringify(newStoredAccounts),
    );
  },

  setStore: async (account) => {
    set(account);
  },
}));

export default useAccountStore;
