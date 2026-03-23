import { backend } from "@/lib/api";
import { initializeSdk } from "@/lib/initialize-sdk";
import useAccountStore, { StorageKeys } from "@/stores/account";
import { ArkaicAccount } from "@/types/arkaic";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { schnorr } from "@noble/curves/secp256k1";
import { hex } from "@scure/base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateAccountParams = {
  account: ArkaicAccount;
  privateKey: string;
};

export function useCreateAccount() {
  const { setStore } = useAccountStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-account"],
    mutationFn: async ({ account, privateKey }: CreateAccountParams) => {
      const storedAccounts = await AsyncStorage.getItem(StorageKeys.Accounts);
      const currentAccounts = storedAccounts ? JSON.parse(storedAccounts) : [];

      const sdk = await initializeSdk(privateKey);
      const pubkey = await getPubkeyHex(sdk.wallet);

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

      setStore({
        account,
        pubkey,
        token,
        ...sdk,
      });

      await AsyncStorage.setItem(
        StorageKeys.Accounts,
        JSON.stringify([...currentAccounts, account]),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
    onError: (err: Error) => console.error(err.message),
  });
}
