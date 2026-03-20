export type Account = {
  pubkey: string;
  username: string;
  createdAt: Date;
  isArbiter: boolean;

  listings?: Listing[];
  buyerChats?: Chat[];
  arbiterChats?: Chat[];
  messages?: Message[];
  favorites?: Favorite[];

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
  iconName: string | null;
  color: string | null;

  childrenOf: number | null;

  parent?: Category | null;
  children?: Category[];

  listings?: ListingCategory[];
};

export type AttributeType = "select" | "boolean" | "text" | "range" | "date" | "multi_select";

export type CategoryAttribute = {
  attributeId: number;
  name: string;
  slug: string;
  type: AttributeType;
  required: boolean;
  isFilterable: boolean;
  values: { id: number; value: string }[];
  rangeMin?: number;
  rangeMax?: number;
  rangeStep?: number;
  rangeUnit?: string;
};

export type ListingAttributeValue = {
  id: number;
  listingId: number;
  attributeId: number;
  valueId: number | null;
  valueBool: boolean | null;
  valueText: string | null;
  valueFloat: number | null;
  attribute: {
    id: number;
    name: string;
    slug: string;
    type: AttributeType;
  };
  value: {
    id: number;
    attributeId: number;
    value: string;
  } | null;
  multiValues: { id: number; value: { id: number; value: string } }[] | null;
};

export type CreateListingAttribute =
  | { attributeId: number; valueId: number }
  | { attributeId: number; valueBool: boolean }
  | { attributeId: number; valueText: string }
  | { attributeId: number; valueIds: number[] };

export type CategoryFilterAttribute = {
  attributeId: number;
  name: string;
  slug: string;
  type: AttributeType;
  isFilterable: boolean;
  values?: { id: number; value: string }[];
  rangeMin?: number;
  rangeMax?: number;
  rangeStep?: number;
  rangeUnit?: string;
};

export type Favorite = {
  id: number;
  userPubkey: string;
  listingId: number;
  listing: Listing;
  createdAt: Date;
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
