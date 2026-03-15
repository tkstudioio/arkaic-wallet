import { backend } from "@/lib/api";
import { ArkaicAccount } from "@/types/arkaic";
import { getMasterFingerprint, mnemonicToPrivateKey } from "@/utils/mnemonic";
import { SingleKey, VtxoManager, Wallet } from "@arkade-os/sdk";
import { schnorr } from "@noble/curves/secp256k1";
import { hex } from "@scure/base";
import { useMutation } from "@tanstack/react-query";

import { ArkadeLightning, BoltzSwapProvider } from "@arkade-os/boltz-swap";
import {
  ExpoArkProvider,
  ExpoIndexerProvider,
} from "@arkade-os/sdk/adapters/expo";

import useAccountStore from "@/stores/account";
import { useRouter } from "expo-router";

type LoginParams = {
  account: ArkaicAccount;
  passphrase?: string;
};

export function useLoginMutation() {
  const { setStore } = useAccountStore();
  const router = useRouter();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ account, passphrase }: LoginParams) => {
      const privateKey = mnemonicToPrivateKey(account.mnemonic, passphrase);

      if (!privateKey) {
        throw new Error("No private key or mnemonic available");
      }

      const identity = SingleKey.fromHex(privateKey);

      const pubkeyBytes = await identity.compressedPublicKey();
      const pubkey = Array.from(pubkeyBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const registerMessage = new TextEncoder().encode(
        `${account.name} ${pubkey}`,
      );

      await backend.post("/auth/register", {
        pubkey,
        username: account.name,
        signature: hex.encode(
          schnorr.sign(registerMessage, hex.decode(privateKey)),
        ),
      });

      const { data: challenge } = await backend.post<{
        nonce: string;
        pubkey: string;
        expiry: Date;
      }>("/auth/challenge", { pubkey });

      const loginMessage = new TextEncoder().encode(
        `${challenge.nonce} ${pubkey}`,
      );

      const { data: token } = await backend.post<string>("/auth/login", {
        pubkey,
        nonce: challenge.nonce,
        signature: hex.encode(
          schnorr.sign(loginMessage, hex.decode(privateKey)),
        ),
      });

      const arkProvider = new ExpoArkProvider("https://mutinynet.arkade.sh");
      const indexerProvider = new ExpoIndexerProvider(
        "https://mutinynet.arkade.sh",
      );

      const wallet = await Wallet.create({
        identity,
        arkProvider,
        indexerProvider,
      });

      const swapProvider = new BoltzSwapProvider({
        apiUrl: "https://api.ark.boltz.exchange",
        network: "bitcoin",
      });

      const arkadeLightning = new ArkadeLightning({
        // @ts-expect-error some strange type error.
        wallet,
        swapProvider,
      });

      const vtxoManager = new VtxoManager(wallet, {
        enabled: true,
      });

      const fingerprint = account.mnemonic
        ? getMasterFingerprint(account.mnemonic, passphrase)
        : undefined;

      setStore({
        pubkey,
        account,
        wallet,
        token,
        arkProvider,
        indexerProvider,
        vtxoManager,
        arkadeLightning,
        fingerprint,
      });

      router.dismissTo("/account/dashboard");
    },
    onError: (err: Error) => console.error(err.message),
  });
}
