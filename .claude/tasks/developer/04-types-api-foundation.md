# Task: Types, API Helpers & Product Field Rename

## Context

The backend has been refactored to introduce Chat, Counter-offers, and Escrow as separate entities. Products no longer hold escrow state. Field names changed from Italian to English (`nome`→`name`, `prezzo`→`price`, `sellerPubkey`→`seller` relation).

This is the **foundation task** — subsequent tasks (05, 06, 07) depend on these changes.

### Current State

- `types/product.ts` — defines `Product` with old Italian field names and escrow fields baked in
- Every hook in `hooks/products/` hardcodes `http://localhost:4000` as base URL
- Some hooks use `fetch`, others use `axios` — inconsistent
- Auth header construction (`Authorization: Bearer ${pubkey}`) is repeated in every hook

### Project Conventions

- **Stack**: React Native + Expo SDK 54, TypeScript, expo-router, Zustand, React Query, Gluestack UI, NativeWind
- **Path alias**: `@/*` → project root
- **Styling**: NativeWind + TailwindCSS, no inline StyleSheet
- **Fonts**: Ubuntu Mono only — `font-heading` (bold), `font-body` (regular)
- **Typography**: `H1`, `P`, `Large`, `Small`, `Muted` from `@/components/ui/typography`

### Backend Prisma Schema (new)

```prisma
model Account {
  id            Int           @id @default(autoincrement())
  pubkey        String        @unique
  accountName   String
  createdAt     DateTime      @default(now())
  products      Products[]
  buyerChats    ProductChat[]
  buyerEscrows  Escrow[]      @relation("EscrowBuyer")
  sellerEscrows Escrow[]      @relation("EscrowSeller")
}

model Products {
  id        Int            @id @default(autoincrement())
  name      String
  price     Float
  sellerId  Int
  seller    Account        @relation(fields: [sellerId], references: [id])
  createdAt DateTime       @default(now())
  chats     ProductChat[]
  events    ProductEvent[]
}

model ProductEvent {
  id        Int      @id @default(autoincrement())
  productId Int
  action    String
  createdAt DateTime @default(now())
  metadata  String?
}

model ProductChat {
  id        Int           @id @default(autoincrement())
  productId Int
  buyerId   Int
  buyer     Account
  status    ChatStatus    @default(active)    // "active" | "concluded"
  createdAt DateTime
  updatedAt DateTime
  messages  ChatMessage[]
  escrow    Escrow?
  @@unique([productId, buyerId])
}

model ChatMessage {
  id         Int
  chatId     Int
  sender     String       // pubkey
  text       String?
  offerPrice Float?       // if set, this is a price proposal
  createdAt  DateTime
}

model Escrow {
  id                       Int
  chatId                   Int          @unique
  chat                     ProductChat
  sellerId                 Int
  seller                   Account
  buyerId                  Int
  buyer                    Account
  value                    Float        // agreed price
  timelockExpiry           Int
  status                   EscrowStatus @default(awaitingFunds)
  sellerSignedCollabPsbt   String?
  collabArkTxid            String?
  serverSignedCheckpoints  String?
  buyerSignedCheckpoints   String?
  createdAt                DateTime
}

enum EscrowStatus {
  awaitingFunds | fundLocked | sellerReady | buyerSubmitted | buyerCheckpointsSigned | refunded | completed
}

enum ChatStatus {
  active | concluded
}
```

## Goal

1. Rewrite `types/product.ts` to match the new backend models
2. Create an API helper module to centralize base URL and auth headers
3. Rename all Italian field references (`nome`→`name`, `prezzo`→`price`) across hooks, screens, and components
4. Update hooks that fetch/create products to use the new types and API helper

## Acceptance Criteria

- [ ] `types/product.ts` exports: `Product`, `ProductEvent`, `Account`, `ProductChat`, `ChatMessage`, `Escrow`, `EscrowStatus`, `ChatStatus` — matching the Prisma schema's JSON serialization (dates as `string`, relations as nested objects where included by API)
- [ ] New file `lib/api.ts` exports: `API_BASE_URL` constant and `getAuthHeaders(wallet)` async helper returning `{ Authorization: "Bearer <pubkey>" }`
- [ ] `Product` type no longer has `nome`, `prezzo`, `sellerPubkey`, `buyerPubkey`, `timelockExpiry`, `status`, `escrowAddress`, `refundRecipientAddress`, `sellerSignedCollabPsbt`, `collabArkTxid`, `serverSignedCheckpoints`, `buyerSignedCheckpoints`
- [ ] `Product` type has `name`, `price`, `sellerId`, `seller?: Account`, `chats?: ProductChat[]`, `events?: ProductEvent[]`
- [ ] `hooks/products/use-products.ts` uses `API_BASE_URL` and `getAuthHeaders` from `@/lib/api`
- [ ] `hooks/products/use-product.ts` uses `API_BASE_URL` and `getAuthHeaders`
- [ ] `hooks/products/use-create-product.ts` sends `{ name, price }` instead of `{ nome, prezzo }`
- [ ] `hooks/products/use-account-products.ts` uses `API_BASE_URL` and `getAuthHeaders`
- [ ] `app/products/create.tsx` uses `name`/`price` state variables and labels
- [ ] `app/products/index.tsx` renders `product.name` and `product.price` (not `nome`/`prezzo`)
- [ ] `app/products/[id].tsx` renders `product.name` and `product.price` — **strip all escrow UI for now** (it will be rebuilt in task 06); keep only the product info card and activity log
- [ ] `components/products-list-item.tsx` renders `product.name`, `product.price`, and `product.seller?.pubkey` (with fallback)
- [ ] No hardcoded `http://localhost:4000` remains in any hook (all use `API_BASE_URL`)
- [ ] TypeScript compiles without errors on modified files

## Files to Create or Modify

### Create

- `lib/api.ts` — API base URL constant + `getAuthHeaders(wallet: Wallet)` helper

### Modify

- `types/product.ts` — Full rewrite with new types
- `hooks/products/use-products.ts` — Use `API_BASE_URL`, `getAuthHeaders`, new `Product` type
- `hooks/products/use-product.ts` — Use `API_BASE_URL`, `getAuthHeaders`, new `Product` type
- `hooks/products/use-create-product.ts` — Use `API_BASE_URL`, `getAuthHeaders`, rename params `nome`→`name`, `prezzo`→`price`
- `hooks/products/use-account-products.ts` — Use `API_BASE_URL`, `getAuthHeaders`; **keep both `useAccountSellingProducts` and `useAccountBuyingProducts` but note that buying will be refactored in task 07**
- `hooks/products/use-buy-product.ts` — **Comment out the entire mutation body** and add a `// TODO: Refactored in task 06 — escrow flow` comment. The buy flow changes completely (chat → accept → fund → check-payment). Leave the hook shell so imports don't break.
- `hooks/products/use-seller-sign-collaborate.ts` — **Comment out body**, add `// TODO: Refactored in task 06 — escrow collaborate`
- `hooks/products/use-seller-sign-checkpoints.ts` — **Comment out body**, add `// TODO: Refactored in task 06`
- `hooks/products/use-buyer-confirm-collaborate.ts` — **Comment out body**, add `// TODO: Refactored in task 06`
- `hooks/products/use-refund.ts` — **Comment out body**, add `// TODO: Refactored in task 06`
- `app/products/create.tsx` — Rename `nome`→`name`, `prezzo`→`price` in state and JSX
- `app/products/[id].tsx` — Strip escrow action buttons and status display; keep product info (name, price, seller) and activity log. Add a placeholder comment `{/* Chat and escrow UI — task 05/06 */}`
- `components/products-list-item.tsx` — Use `product.name`, `product.price`, `product.seller?.pubkey`

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Use NativeWind + TailwindCSS for styling
- Do not modify Gluestack base components in `components/ui/`
- Keep changes minimal and focused on the task
- Prefer `fetch` over `axios` for consistency — but do not refactor existing `axios` calls unless you're already modifying that hook
