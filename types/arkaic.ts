export type ArkaicAccount = {
  name: string;
  privateKey?: string;
  arkadeServerUrl: string;
  avatar?: string;
  mnemonic?: string;
};

export type ArkaicPayment = {
  onchainAddress?: string;
  arkAddress?: string;
  lightningInvoice?: string;
  signerPubkey?: string;
  amount?: number;
};
