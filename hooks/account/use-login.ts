import { backend } from "@/lib/api";
import { initializeSdk } from "@/lib/initialize-sdk";
import useAccountStore from "@/stores/account";
import { ArkaicAccount } from "@/types/arkaic";
import { getMasterFingerprint, mnemonicToPrivateKey } from "@/utils/mnemonic";
import { schnorr } from "@noble/curves/secp256k1";
import { hex } from "@scure/base";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type LoginParams = {
  account: ArkaicAccount;
  passphrase?: string;
};

export function useLogin() {
  const { setStore } = useAccountStore();
  const router = useRouter();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ account, passphrase }: LoginParams) => {
      const privateKey = mnemonicToPrivateKey(account.mnemonic, passphrase);

      if (!privateKey) {
        throw new Error("No private key or mnemonic available");
      }

      const sdk = await initializeSdk(privateKey);

      const pubkeyBytes = await sdk.wallet.identity.compressedPublicKey();
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

      const fingerprint = account.mnemonic
        ? getMasterFingerprint(account.mnemonic, passphrase)
        : undefined;

      setStore({
        pubkey,
        account,
        token,
        fingerprint,
        ...sdk,
      });

      router.replace("/wallet");
    },
    onError: (err: Error) => console.error(err.message),
  });
}
