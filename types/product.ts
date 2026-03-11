export type EscrowStatus =
  | "awaitingFunds"
  | "fundLocked"
  | "sellerReady"
  | "buyerSubmitted"
  | "buyerCheckpointsSigned"
  | "refunded"
  | "completed";

export type ChatStatus = "active" | "concluded";

export type Account = {
  id: number;
  pubkey: string;
  accountName: string;
  createdAt: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  sellerId: number;
  seller?: Account;
  createdAt: string;
  chats?: ProductChat[];
  events?: ProductEvent[];
};

export type ProductEvent = {
  id: number;
  productId: number;
  action: string;
  createdAt: string;
  metadata?: string | null;
};

export type ProductChat = {
  id: number;
  productId: number;
  buyerId: number;
  buyer?: Account;
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  escrow?: Escrow;
};

export type ChatMessage = {
  id: number;
  chatId: number;
  sender: string;
  text?: string | null;
  offerPrice?: number | null;
  createdAt: string;
};

export type Escrow = {
  id: number;
  chatId: number;
  chat?: ProductChat;
  sellerId: number;
  seller?: Account;
  buyerId: number;
  buyer?: Account;
  value: number;
  timelockExpiry: number;
  status: EscrowStatus;
  sellerSignedCollabPsbt?: string | null;
  collabArkTxid?: string | null;
  serverSignedCheckpoints?: string | null;
  buyerSignedCheckpoints?: string | null;
  createdAt: string;
};
