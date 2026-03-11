import { Wallet } from "@arkade-os/sdk";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";

// TODO: replace with actual API base URL
export const API_BASE_URL = "http://localhost:4000";

export async function getAuthHeaders(wallet: Wallet) {
  const pubkey = await getPubkeyHex(wallet);
  return { Authorization: `Bearer ${pubkey}` };
}
