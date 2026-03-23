import { createStorageConfig } from "@/lib/sqlite-storage";
import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import { SingleKey, VtxoManager, Wallet } from "@arkade-os/sdk";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";

export type SdkInstances = {
  wallet: Wallet;
  arkProvider: ExpoArkProvider;
  indexerProvider: ExpoIndexerProvider;
  vtxoManager: VtxoManager;
  arkadeLightning: ArkadeLightning;
};

const ARK_SERVER_URL = "https://mutinynet.arkade.sh";
const BOLTZ_API_URL = "https://api.ark.boltz.exchange";

export async function initializeSdk(privateKey: string): Promise<SdkInstances> {
  const identity = SingleKey.fromHex(privateKey);

  const arkProvider = new ExpoArkProvider(ARK_SERVER_URL);
  const indexerProvider = new ExpoIndexerProvider(ARK_SERVER_URL);

  const storage = createStorageConfig();
  const wallet = await Wallet.create({
    identity,
    arkProvider,
    indexerProvider,
    storage,
  });

  const swapProvider = new BoltzSwapProvider({
    apiUrl: BOLTZ_API_URL,
    network: "bitcoin",
  });

  // @ts-expect-error ArkadeLightning expects WalletV2 but SDK exports Wallet -- tracked as SDK type mismatch
  const arkadeLightning = new ArkadeLightning({
    wallet,
    swapProvider,
  });

  const vtxoManager = new VtxoManager(wallet);

  return {
    wallet,
    arkProvider,
    indexerProvider,
    vtxoManager,
    arkadeLightning,
  };
}
