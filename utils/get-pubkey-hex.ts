import { Wallet } from "@arkade-os/sdk";

export async function getPubkeyHex(wallet: Wallet): Promise<string> {
  const pubkeyBytes = await wallet.identity.compressedPublicKey();
  return Array.from(pubkeyBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
