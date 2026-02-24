import { ArkaicAccount } from "@/types/arkaic";
import { SingleKey, Wallet } from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";
import { useQuery } from "@tanstack/react-query";

export function useWallet(account: ArkaicAccount) {
  return useQuery({
    queryKey: ["wallet", account.privateKey],
    queryFn: async () => {
      const arkProvider = new ExpoArkProvider(account.arkadeServerUrl);
      const indexerProvider = new ExpoIndexerProvider(account.arkadeServerUrl);
      const identity = SingleKey.fromHex(account.privateKey);

      return await Wallet.create({
        identity,
        arkProvider,
        indexerProvider,
      });
    },
  });
}
