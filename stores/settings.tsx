import { create } from "zustand";

type SettingsStore = {
  detailedTransactions: boolean;
  toggleDetailedTransactions: () => void;
};

const useSettingsStore = create<SettingsStore>((set) => ({
  detailedTransactions: false,
  toggleDetailedTransactions: () =>
    set(({ detailedTransactions }) => ({
      detailedTransactions: !detailedTransactions,
    })),
}));

export default useSettingsStore;
