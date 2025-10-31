export type ArkaicProfile = {
  name: string;
  privateKey: string;
  arkadeServerUrl: string;
  avatar?: string;
};

export type ArkaicPayment = {
  onchainAddress?: string;
  arkAddress?: string;
  lightningInvoice?: string;
  signerPubkey?: string;
  amount?: number;
};
