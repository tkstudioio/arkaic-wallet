import { CurrencySymbol } from "@/hooks/use-bitcoin-price";
import { create } from "zustand";

export enum ChainSetting {
  Onchain = "onchain",
  Ark = "ark",
}
type SettingsStore = {
  detailedTransactions: boolean;
  toggleDetailedTransactions: () => void;
  symbol: CurrencySymbol;
  setSymbol: (symbol: CurrencySymbol) => void;
};

const useSettingsStore = create<SettingsStore>((set) => ({
  detailedTransactions: false,
  toggleDetailedTransactions: () =>
    set(({ detailedTransactions }) => ({
      detailedTransactions: !detailedTransactions,
    })),
  symbol: "EUR",
  setSymbol: (symbol) =>
    set({
      symbol,
    }),
}));

export default useSettingsStore;
