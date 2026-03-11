# Task: Chat & Counter-offer System

## Context

**Depends on task 04** — types and API helpers must be in place first.

The backend now supports per-product, per-buyer chat with optional counter-offers (price proposals). A buyer can open a chat on any product, exchange messages with the seller, and propose/counter-propose prices before committing to an escrow.

### Backend API Endpoints

```
POST   /products/:id/chats          — Open or resume a chat (auth required)
       Body: { text?: string, offerPrice?: number }
       Returns: ProductChat (with messages)

GET    /products/:id/chats          — List chats for a product (auth required)
       Seller sees all chats, buyer sees only their own
       Returns: ProductChat[]

GET    /chats/:chatId               — Chat detail with all messages (auth required, participants only)
       Returns: ProductChat (with messages, product, escrow)

POST   /chats/:chatId/messages      — Send message or counter-offer (auth required, participants only)
       Body: { text?: string, offerPrice?: number }
       Returns: ChatMessage

POST   /chats/:chatId/accept        — Buyer accepts, creates escrow (auth required, buyer only)
       Body: { timelockExpiry: number }
       Returns: Escrow
```

### Types (from task 04 — `types/product.ts`)

```ts
type ChatStatus = "active" | "concluded";

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

type ChatMessage = {
  id: number;
  chatId: number;
  sender: string;     // pubkey
  text: string | null;
  offerPrice: number | null;
  createdAt: string;
};

type Account = {
  id: number;
  pubkey: string;
  accountName: string;
  createdAt: string;
};
```

### Project Conventions

- **Stack**: React Native + Expo SDK 54, TypeScript, expo-router, Zustand, React Query, Gluestack UI, NativeWind
- **Path alias**: `@/*` → project root
- **Fonts**: Ubuntu Mono only — `font-heading` (bold), `font-body` (regular)
- **Typography**: `H1`, `P`, `Large`, `Small`, `Muted` from `@/components/ui/typography`
- **Existing UI components** (in `components/ui/`): Button, Input, Card, VStack, HStack, Badge, Spinner, Divider, ScrollView
- **Hooks location**: `hooks/products/` for product-related hooks; create `hooks/chats/` for chat hooks
- **API helper**: `lib/api.ts` exports `API_BASE_URL` and `getAuthHeaders(wallet)`
- **Store**: `stores/account.ts` has `useAccountStore()` with `{ wallet, account, ... }`

## Goal

Build the complete chat and counter-offer system:
1. React Query hooks for all chat endpoints
2. Chat list screen for product detail (seller sees all buyer chats, buyer sees their own)
3. Chat detail screen with message thread and input
4. Counter-offer UI (messages with `offerPrice` rendered as offer cards)
5. Integration into product detail page

## Acceptance Criteria

- [ ] `hooks/chats/use-product-chats.ts` — `useProductChats(productId)` query hook, fetches `GET /products/:id/chats`
- [ ] `hooks/chats/use-chat.ts` — `useChat(chatId)` query hook, fetches `GET /chats/:chatId`, refetchInterval 5s
- [ ] `hooks/chats/use-open-chat.ts` — `useOpenChat()` mutation hook, calls `POST /products/:id/chats` with `{ text?, offerPrice? }`
- [ ] `hooks/chats/use-send-message.ts` — `useSendMessage()` mutation hook, calls `POST /chats/:chatId/messages` with `{ text?, offerPrice? }`, invalidates chat query on success
- [ ] `hooks/chats/use-accept-offer.ts` — `useAcceptOffer()` mutation hook, calls `POST /chats/:chatId/accept` with `{ timelockExpiry }`, invalidates chat query on success
- [ ] Route `app/chats/[chatId].tsx` — Chat detail screen showing message thread and input bar
- [ ] Route `app/chats/_layout.tsx` — Layout for chat screens (same pattern as products layout)
- [ ] `app/products/[id].tsx` — Updated: shows product info + chat section below. Seller sees list of buyer chats (link to each). Buyer sees a "Chat with seller" / "Open chat" button that opens/resumes their chat.
- [ ] Chat messages render correctly: text messages as bubbles (sender-aligned), offer messages as highlighted cards showing the proposed price
- [ ] The chat detail screen has an input bar at the bottom with: text input, send button, and a "Propose price" toggle/button that shows a numeric input for `offerPrice`
- [ ] The "Accept" button is only visible to the buyer in the chat detail, and only when there's no existing escrow on the chat
- [ ] After accepting, the escrow data is visible in the chat detail (status, value)
- [ ] Chat list on product detail shows buyer name/pubkey and last message preview
- [ ] All hooks use `getAuthHeaders` from `@/lib/api`
- [ ] Navigation: product detail → chat detail works via expo-router

## Files to Create or Modify

### Create

- `hooks/chats/use-product-chats.ts` — Query hook for product's chats
- `hooks/chats/use-chat.ts` — Query hook for single chat with messages
- `hooks/chats/use-open-chat.ts` — Mutation hook to open/resume chat
- `hooks/chats/use-send-message.ts` — Mutation hook to send message
- `hooks/chats/use-accept-offer.ts` — Mutation hook to accept and create escrow
- `app/chats/_layout.tsx` — Chat screens layout
- `app/chats/[chatId].tsx` — Chat detail screen (message thread + input + accept button)
- `components/chat-message-item.tsx` — Renders a single chat message (text bubble or offer card)
- `components/chat-list-item.tsx` — Renders a chat preview in the product detail chat list

### Modify

- `app/products/[id].tsx` — Add chat section: for seller, show chat list; for buyer, show "Open chat" button or link to existing chat
- `app/products/_layout.tsx` — No changes expected, but verify chat routes are accessible

## Implementation Notes

### Chat detail screen structure (`app/chats/[chatId].tsx`)

```
┌─────────────────────────┐
│ Product: <name> — <price>│  ← header with product info
│ Chat with: <other party> │
├─────────────────────────┤
│                         │
│  [message bubbles]      │  ← FlatList, inverted
│  [offer cards]          │
│                         │
├─────────────────────────┤
│ [Escrow status banner]  │  ← if escrow exists, show status
├─────────────────────────┤
│ [Accept offer] button   │  ← buyer only, if no escrow
├─────────────────────────┤
│ [text input] [💰] [→]  │  ← input bar
└─────────────────────────┘
```

### Message alignment

- Messages where `sender === userPubkey` align right (your messages)
- Messages where `sender !== userPubkey` align left (other party)
- Use `userXOnlyPubkey` or `userCompressedPubkey` for comparison (same pattern as current `app/products/[id].tsx`)

### Offer message rendering

When a `ChatMessage` has `offerPrice !== null`, render it as a special card:
```
┌──────────────────────┐
│ 💰 Price proposal    │
│ 50,000 sats          │
│ (+ optional text)    │
└──────────────────────┘
```

Use a distinct background color (e.g., `bg-arkaic-primary/10` or similar subtle highlight).

### Accept flow

When buyer taps "Accept":
1. Compute `timelockExpiry = Math.floor(subMinutes(new Date(), 5).getTime() / 1000)` (same as current `use-buy-product.ts`)
2. Call `POST /chats/:chatId/accept` with `{ timelockExpiry }`
3. On success, the escrow is created. The chat query will refetch and show the escrow.
4. The actual fund-sending and escrow flow is handled in task 06.

### Product detail chat section

For the seller viewing their own product:
```tsx
// Fetch chats for this product
const { data: chats } = useProductChats(product.id);
// Render list of ChatListItem components, each linking to /chats/[chatId]
```

For a buyer viewing a product:
```tsx
// Check if buyer already has a chat (chats list filtered by own pubkey, or just try to open)
// Show "Chat with seller" button → calls useOpenChat → navigates to /chats/[chatId]
```

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Use NativeWind + TailwindCSS for styling; do not use inline StyleSheet unless unavoidable
- Do not modify Gluestack base components in `components/ui/`
- Keep changes minimal and focused on the task
- Use `FlatList` (from react-native) for the message list, not `ScrollView`, for performance
