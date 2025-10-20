import { create } from "zustand";

export enum ChainSetting {
  Onchain = "onchain",
  Ark = "ark",
}
type SettingsStore = {
  detailedTransactions: boolean;
  toggleDetailedTransactions: () => void;
  chain: ChainSetting;
  setChain: (chain: ChainSetting) => void;
};

const useSettingsStore = create<SettingsStore>((set) => ({
  detailedTransactions: false,
  toggleDetailedTransactions: () =>
    set(({ detailedTransactions }) => ({
      detailedTransactions: !detailedTransactions,
    })),
  chain: ChainSetting.Ark,
  setChain: (chain) =>
    set({
      chain,
    }),
}));

export default useSettingsStore;
