export type Account = {
  pubkey: string;
  username: string;
  createdAt: Date;
  isArbiter: boolean;

  listings?: Listing[];
  buyerChats?: Chat[];
  arbiterChats?: Chat[];
  messages?: Message[];

  buyerEscrows?: Escrow[];
  sellerEscrows?: Escrow[];
  arbiterEscrows?: Escrow[];

  reviewsReceived?: Review[];
  reviewsGiven?: Review[];
};

export type Challenge = {
  nonce: string;
  pubkey: string;
  expiry: Date;
};

export type Review = {
  id: number;

  reviewedPubkey: string;
  reviewed?: Account;

  reviewerPubkey: string;
  reviewer?: Account;

  signature: string;
  rating: number;
  message: string;

  escrowAddress: string;
  escrow?: Escrow;
};

export type Listing = {
  id: number;

  sellerPubkey: string;
  seller?: Account;

  signature: string;
  name: string;
  description?: string;
  price: number;

  createdAt: Date;
  category?: Category;
  categoryId?: number;
  chats?: Chat[];
  attributes?: ListingAttributeValue[];
};

export type ListingCategory = {
  listingId: number;
  listing?: Listing;

  categoryId: number;
  category?: Category;
};

export type ChatStatus = "open" | "closed";

export type Chat = {
  id: number;

  listingId: number;
  listing: Listing;

  buyerPubkey: string;
  buyer?: Account;

  arbiterPubkey: string | null;
  arbiter?: Account | null;

  signature: string;

  status: ChatStatus;
  createdAt: Date;

  messages?: Message[];

  escrow?: Escrow | null;
};

export type Message = {
  id: number;

  chatId: number;
  chat?: Chat;

  message: string | null;

  senderPubkey: string | null;
  sender?: Account | null;

  signature: string | null;

  isSystem: boolean;

  sentAt: Date;

  offer?: Offer | null;
};

export type Offer = {
  id: number;

  messageId: number;
  message?: Message;

  price: number;
  valid: boolean;

  createdAt: Date;

  acceptance?: OfferAcceptance | null;
  escrow?: Escrow | null;
};

export type OfferAcceptance = {
  id: number;

  offerId: number;
  offer?: Offer;

  signature: string;
  accepted: boolean;

  createdAt: Date;
};

export type Category = {
  id: number;
  name: string;
  slug: string;

  childrenOf: number | null;

  parent?: Category | null;
  children?: Category[];

  listings?: ListingCategory[];
};

export type CategoryAttribute = {
  attributeId: number;
  name: string;
  slug: string;
  type: "select" | "boolean";
  required: boolean;
  isFilterable: boolean;
  values: { id: number; value: string }[];
};

export type ListingAttributeValue = {
  listingId: number;
  attributeId: number;
  valueId: number | null;
  valueBool: boolean | null;
  attribute: {
    id: number;
    name: string;
    slug: string;
    type: "select" | "boolean";
  };
  value: {
    id: number;
    attributeId: number;
    value: string;
  } | null;
};

export type EscrowStatus =
  | "awaitingFunds"
  | "partiallyFunded"
  | "fundLocked"
  | "sellerReady"
  | "buyerSubmitted"
  | "buyerCheckpointsSigned"
  | "completed"
  | "refunded";

export type Escrow = {
  address: string;

  buyerPubkey: string;
  buyer?: Account;

  sellerPubkey: string;
  seller?: Account;

  serverPubkey: string;

  arbiterPubkey: string | null;
  arbiter?: Account | null;

  price: number;

  timelockExpiry: number;

  chatId: number;
  chat?: Chat;

  offerId: number | null;
  offer?: Offer | null;

  status: EscrowStatus;

  sellerSignedCollabPsbt?: string | null;
  collabArkTxid?: string | null;
  serverSignedCheckpoints?: string | null;
  buyerSignedCheckpoints?: string | null;

  createdAt: Date;
  fundedAt?: Date | null;
  releasedAt?: Date | null;

  reviews?: Review[];
};
