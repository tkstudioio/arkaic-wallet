# Task: Account Screens — Selling & Buying Update

## Context

**Depends on tasks 04, 05, and 06** — types, chat system, and escrow system must be in place.

The backend `/account/selling` and `/account/buying` endpoints now return different data shapes:
- `/account/selling` returns `Product[]` (with `seller` relation) — products where the authenticated user is the seller
- `/account/buying` returns `ProductChat[]` (with `product`, `buyer`, `escrow` included) — chats where the authenticated user is the buyer

The buying screen must change from showing products to showing chats (each representing a negotiation/purchase flow with a seller).

### Backend API Endpoints

```
GET /account/selling   — Returns Product[] (seller's listings)
GET /account/buying    — Returns ProductChat[] (buyer's chats, with product + escrow)
```

### Types (from task 04)

```ts
type Product = {
  id: number;
  name: string;
  price: number;
  sellerId: number;
  seller?: Account;
  createdAt: string;
  events?: ProductEvent[];
};

type ProductChat = {
  id: number;
  productId: number;
  product?: Product;
  buyerId: number;
  buyer?: Account;
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  escrow?: Escrow | null;
};
```

### Current State

- `hooks/products/use-account-products.ts` — Both `useAccountSellingProducts` and `useAccountBuyingProducts` return `Product[]`
- `app/account/selling.tsx` — Renders product grid using `ProductsListItem`
- `app/account/buying.tsx` — Renders product grid using `ProductsListItem` (same as selling, but for purchases)
- Both use `queryKey: ["account-products"]` (collision!)

### Project Conventions

- **Stack**: React Native + Expo SDK 54, TypeScript, expo-router, Zustand, React Query, Gluestack UI, NativeWind
- **Path alias**: `@/*` → project root
- **Typography**: `H1`, `P`, `Large`, `Small`, `Muted` from `@/components/ui/typography`
- **API helper**: `lib/api.ts` exports `API_BASE_URL` and `getAuthHeaders(wallet)`

## Goal

1. Fix query key collision between selling and buying hooks
2. Update the selling screen to work with the new `Product` type (minor — just field renames)
3. Rewrite the buying screen to display chats instead of products, with escrow status badges
4. Create a buying chat list item component

## Acceptance Criteria

- [ ] `useAccountSellingProducts` uses query key `["account-selling"]` and returns `Product[]` with new field names
- [ ] `useAccountBuyingProducts` is renamed to `useAccountBuyingChats`, uses query key `["account-buying"]`, and returns `ProductChat[]`
- [ ] Both hooks use `API_BASE_URL` and `getAuthHeaders` from `@/lib/api`
- [ ] `app/account/selling.tsx` renders products with `product.name` and `product.price` (using `ProductsListItem` which was updated in task 04)
- [ ] `app/account/buying.tsx` renders a list of chats, each showing:
  - Product name and price (from `chat.product`)
  - Seller pubkey (short, from `chat.product.seller.pubkey`)
  - Chat status badge: "Active" (green) or "Concluded" (gray)
  - Escrow status badge if escrow exists (color-coded by status)
  - Last message preview (truncated)
  - Tapping navigates to `/chats/[chatId]`
- [ ] New component `components/buying-chat-item.tsx` — Renders a single buying chat card
- [ ] No query key collision between selling and buying
- [ ] TypeScript compiles without errors on modified files

## Files to Create or Modify

### Create

- `components/buying-chat-item.tsx` — Chat card for the buying screen

### Modify

- `hooks/products/use-account-products.ts` — Fix query keys; rename `useAccountBuyingProducts` to `useAccountBuyingChats` with `ProductChat[]` return type; use API helpers
- `app/account/buying.tsx` — Rewrite to render chats using `BuyingChatItem`, import `useAccountBuyingChats`
- `app/account/selling.tsx` — Update import if hook name changed; verify it works with new Product type

## Implementation Notes

### Buying chat item component

```
┌─────────────────────────────────────┐
│ [Product name]           [status]   │
│ [price] sats                        │
│ Seller: abc1234...                  │
│ "Last message text preview..."      │
│                    [escrow badge]   │
└─────────────────────────────────────┘
```

### Escrow status badge colors

```ts
const escrowBadgeColor: Record<EscrowStatus, string> = {
  awaitingFunds: "bg-yellow-100 text-yellow-800",
  fundLocked: "bg-blue-100 text-blue-800",
  sellerReady: "bg-blue-100 text-blue-800",
  buyerSubmitted: "bg-blue-100 text-blue-800",
  buyerCheckpointsSigned: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  refunded: "bg-red-100 text-red-800",
};
```

### Escrow status labels (human-readable)

```ts
const escrowStatusLabel: Record<EscrowStatus, string> = {
  awaitingFunds: "Awaiting funds",
  fundLocked: "Funds locked",
  sellerReady: "Seller ready",
  buyerSubmitted: "Buyer submitted",
  buyerCheckpointsSigned: "Checkpoints signed",
  completed: "Completed",
  refunded: "Refunded",
};
```

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Use NativeWind + TailwindCSS for styling; do not use inline StyleSheet unless unavoidable
- Do not modify Gluestack base components in `components/ui/`
- Keep changes minimal and focused on the task
