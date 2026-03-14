export type ArkaicAccount = {
  name: string;
  mnemonic: string;
  customVtxoScripts?: string[];
};

export type ArkaicPayment = {
  onchainAddress?: string;
  arkAddress?: string;
  lightningInvoice?: string;
  signerPubkey?: string;
  amount?: number;
};
