import { HDKey } from "@scure/bip32";
import {
  generateMnemonic as _generateMnemonic,
  validateMnemonic as _validateMnemonic,
  mnemonicToSeedSync,
} from "@scure/bip39";

import { bytesToHex } from "@noble/hashes/utils.js";
import { wordlist } from "@scure/bip39/wordlists/english.js";
const DERIVATION_PATH = "m/84'/0'/0'/0/0";

export function generateMnemonic(wordCount: 12 | 24 = 12): string {
  const strength = wordCount === 12 ? 128 : 256;
  return _generateMnemonic(wordlist, strength);
}

export function mnemonicToPrivateKey(
  mnemonic: string,
  passphrase?: string,
): string {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdKey = HDKey.fromMasterSeed(seed);
  const child = hdKey.derive(DERIVATION_PATH);

  if (!child.privateKey) {
    throw new Error("Failed to derive private key");
  }

  return bytesToHex(child.privateKey);
}

export function getMasterFingerprint(
  mnemonic: string,
  passphrase?: string,
): string {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const hdKey = HDKey.fromMasterSeed(seed);
  return hdKey.fingerprint.toString(16).padStart(8, "0");
}

export function validateMnemonic(mnemonic: string): boolean {
  return _validateMnemonic(mnemonic, wordlist);
}

export function getRandomVerificationIndices(
  wordCount: number,
  count: number,
): number[] {
  const indices: Set<number> = new Set();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * wordCount));
  }
  return Array.from(indices).sort((a, b) => a - b);
}
