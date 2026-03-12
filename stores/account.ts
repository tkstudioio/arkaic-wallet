import { create } from "zustand";

import { ArkadeLightning } from "@arkade-os/boltz-swap";
import {
  ArkProvider,
  IndexerProvider,
  VtxoManager,
  Wallet,
} from "@arkade-os/sdk";

import { ArkaicAccount } from "@/types/arkaic";
type AccountStore = {
  token?: string;
  arkadeLightning?: ArkadeLightning;
  arkProvider?: ArkProvider;
  indexerProvider?: IndexerProvider;
  vtxoManager?: VtxoManager;
  wallet?: Wallet;
  fingerprint?: string;
  showTransactionsList: boolean;
  setShowTransactionsList: (showTransactionsList: boolean) => void;
  logout: () => void;
  setStore: (
    storeValues: Partial<
      Omit<AccountStore, "setStore" | "logout" | "setShowTransactionsList">
    >,
  ) => void;
  account?: ArkaicAccount;
};

export enum StorageKeys {
  Accounts = "accounts",
}

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
      fingerprint: undefined,
    });
  },

  setStore: async (account) => {
    set(account);
  },
}));

export default useAccountStore;
