import { ArkaicProfile } from "@/types/arkaic";
import { SingleKey, Wallet } from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";
import { useQuery } from "@tanstack/react-query";

export function useWallet(profile: ArkaicProfile) {
  return useQuery({
    queryKey: ["wallet", profile.privateKey],
    queryFn: async () => {
      const arkProvider = new ExpoArkProvider(profile.arkadeServerUrl);
      const indexerProvider = new ExpoIndexerProvider(profile.arkadeServerUrl);
      const identity = SingleKey.fromHex(profile.privateKey);

      return await Wallet.create({
        identity,
        arkProvider,
        indexerProvider,
      });
    },
  });
}
