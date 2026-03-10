export type ProductStatus =
  | "awaitingFunds"
  | "fundLocked"
  | "sellerReady"
  | "buyerSubmitted"
  | "buyerCheckpointsSigned"
  | "payed"
  | "refunded";

export type ProductEvent = {
  id: number;
  productId: number;
  action: string;
  createdAt: string;
  metadata: Record<string, string> | null;
};

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
  status: ProductStatus;
  events?: ProductEvent[];
};
