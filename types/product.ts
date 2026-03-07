export type Product = {
  id: number;
  nome: string;
  prezzo: number;
  sellerPubkey: string;
  createdAt: string;
  escrowAddress: string;
  buyerPubkey: string;
  refundRecipientAddress: string;
  timelockExpiry: number;
  status: string;
};
