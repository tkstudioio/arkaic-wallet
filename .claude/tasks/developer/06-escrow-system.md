# Task: Escrow System — Buy Flow, Collaborate & Refund Migration

## Context

**Depends on tasks 04 and 05** — types, API helpers, and chat system must be in place first.

The escrow lifecycle has been decoupled from Product and moved to its own entity. The backend routes changed from `/products/:id/collaborate/*` and `/products/:id/refund/*` to `/escrows/:escrowId/collaborate/*` and `/escrows/:escrowId/refund/*`. The buy flow now requires: accept offer in chat → send funds to escrow address → check payment.

### Backend API Endpoints

```
GET    /escrows/:escrowId                — Escrow detail (auth required, participants only)
       Returns: Escrow (with chat, buyer, seller)

GET    /escrows/:escrowId/check-payment  — Check if funds are locked
       Returns: Escrow (status updated to fundLocked if funds detected)

Collaborative flow:
GET    /escrows/:escrowId/collaborate/seller-psbt
POST   /escrows/:escrowId/collaborate/seller-submit-psbt     Body: { signedPsbt }
GET    /escrows/:escrowId/collaborate/buyer-psbt
POST   /escrows/:escrowId/collaborate/buyer-submit-psbt      Body: { signedPsbt }
POST   /escrows/:escrowId/collaborate/buyer-sign-checkpoints  Body: { signedCheckpointTxs }
GET    /escrows/:escrowId/collaborate/seller-checkpoints
POST   /escrows/:escrowId/collaborate/seller-sign-checkpoints Body: { signedCheckpointTxs }

Refund flow:
GET    /escrows/:escrowId/refund/psbt
POST   /escrows/:escrowId/refund/submit-signed-psbt          Body: { signedPsbt }
POST   /escrows/:escrowId/refund/finalize                    Body: { arkTxid, signedCheckpointTxs }
```

### Types (from task 04)

```ts
type EscrowStatus = "awaitingFunds" | "fundLocked" | "sellerReady" | "buyerSubmitted" | "buyerCheckpointsSigned" | "refunded" | "completed";

type Escrow = {
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
  sellerSignedCollabPsbt: string | null;
  collabArkTxid: string | null;
  serverSignedCheckpoints: string | null;
  buyerSignedCheckpoints: string | null;
  createdAt: string;
};
```

### Current Hooks (to migrate)

These hooks currently operate on Product and hit `/products/:id/*` URLs. They must be rewritten to operate on Escrow and hit `/escrows/:escrowId/*`:

- `hooks/products/use-buy-product.ts` — Builds escrow script, sends BTC, calls check-payment
- `hooks/products/use-seller-sign-collaborate.ts` — Gets seller PSBT, signs, submits
- `hooks/products/use-seller-sign-checkpoints.ts` — Gets seller checkpoints, signs, submits
- `hooks/products/use-buyer-confirm-collaborate.ts` — Gets buyer PSBT, signs, submits + signs checkpoints
- `hooks/products/use-refund.ts` — Gets refund PSBT, signs, submits, signs checkpoints, finalizes

All these hooks share the same Ark protocol logic (PSBT signing with `Transaction.fromPSBT`, `wallet.identity.sign`, checkpoint signing). Only the URL and the entity they read from change.

### Ark SDK Imports Used

```ts
import { Transaction } from "@arkade-os/sdk";
import { CLTVMultisigTapscript, MultisigTapscript, VtxoScript } from "@arkade-os/sdk";
import { hex, base64 } from "@scure/base";
```

### Project Conventions

- **Stack**: React Native + Expo SDK 54, TypeScript, expo-router, Zustand, React Query, Gluestack UI, NativeWind
- **Path alias**: `@/*` → project root
- **API helper**: `lib/api.ts` exports `API_BASE_URL` and `getAuthHeaders(wallet)`
- **Store**: `stores/account.ts` has `useAccountStore()` with `{ wallet, account, arkProvider, ... }`

## Goal

1. Create escrow-specific hooks under `hooks/escrows/`
2. Rewrite the buy flow to work with the new chat→escrow model
3. Migrate collaborate and refund flows from product-based to escrow-based URLs
4. Build an escrow detail screen showing status and action buttons
5. Integrate escrow actions into the chat detail screen
6. Remove the old product-based escrow hooks (or replace their contents)

## Acceptance Criteria

- [ ] `hooks/escrows/use-escrow.ts` — `useEscrow(escrowId)` query hook, fetches `GET /escrows/:escrowId`, refetchInterval 10s
- [ ] `hooks/escrows/use-check-payment.ts` — `useCheckPayment()` mutation hook, calls `GET /escrows/:escrowId/check-payment`
- [ ] `hooks/escrows/use-fund-escrow.ts` — `useFundEscrow()` mutation hook that: (1) builds the escrow script from buyer/seller/server pubkeys (same logic as current `use-buy-product.ts`), (2) sends BTC via `wallet.sendBitcoin()`, (3) calls check-payment. Accepts `{ escrow: Escrow, sellerPubkey: string }` as params.
- [ ] `hooks/escrows/use-seller-sign-collaborate.ts` — Same PSBT signing logic as current, but URL is `/escrows/:escrowId/collaborate/seller-psbt` and `/escrows/:escrowId/collaborate/seller-submit-psbt`. Accepts `escrowId: number`.
- [ ] `hooks/escrows/use-buyer-confirm-collaborate.ts` — Same logic, URLs updated to `/escrows/:escrowId/collaborate/buyer-psbt`, `buyer-submit-psbt`, `buyer-sign-checkpoints`. Accepts `escrowId: number`.
- [ ] `hooks/escrows/use-seller-sign-checkpoints.ts` — Same logic, URLs updated. Accepts `escrowId: number`.
- [ ] `hooks/escrows/use-refund.ts` — Same logic, URLs updated to `/escrows/:escrowId/refund/psbt`, `submit-signed-psbt`, `finalize`. Accepts `escrowId: number`.
- [ ] Old hooks in `hooks/products/` (`use-buy-product.ts`, `use-seller-sign-collaborate.ts`, `use-seller-sign-checkpoints.ts`, `use-buyer-confirm-collaborate.ts`, `use-refund.ts`) are **deleted**
- [ ] `app/chats/[chatId].tsx` (from task 05) is updated to show escrow section when `chat.escrow` exists:
  - Escrow status badge
  - "Fund escrow" button (buyer, when status === `awaitingFunds`)
  - "Sign collaborate" button (seller, when status === `fundLocked`)
  - "Confirm collaborate" button (buyer, when status === `sellerReady`)
  - "Sign checkpoints" button (seller, when status === `buyerSubmitted` or `buyerCheckpointsSigned`)
  - "Claim refund" button (buyer, when timelock expired and status allows)
  - "Completed" / "Refunded" label for terminal states
- [ ] All escrow hooks use `getAuthHeaders` from `@/lib/api` and `API_BASE_URL`
- [ ] Escrow actions invalidate the chat query (so the UI refreshes)
- [ ] TypeScript compiles without errors on modified files

## Files to Create or Modify

### Create

- `hooks/escrows/use-escrow.ts` — Query hook for escrow detail
- `hooks/escrows/use-check-payment.ts` — Mutation hook for check-payment
- `hooks/escrows/use-fund-escrow.ts` — Mutation hook: build escrow script + send BTC + check-payment
- `hooks/escrows/use-seller-sign-collaborate.ts` — Mutation hook: seller signs collaborate PSBT
- `hooks/escrows/use-buyer-confirm-collaborate.ts` — Mutation hook: buyer signs collaborate + checkpoints
- `hooks/escrows/use-seller-sign-checkpoints.ts` — Mutation hook: seller signs checkpoints
- `hooks/escrows/use-refund.ts` — Mutation hook: full refund flow

### Modify

- `app/chats/[chatId].tsx` — Add escrow action section below the message thread
- `app/products/[id].tsx` — Remove any remaining escrow UI remnants (should already be stripped in task 04)

### Delete

- `hooks/products/use-buy-product.ts`
- `hooks/products/use-seller-sign-collaborate.ts`
- `hooks/products/use-seller-sign-checkpoints.ts`
- `hooks/products/use-buyer-confirm-collaborate.ts`
- `hooks/products/use-refund.ts`

## Implementation Notes

### Fund escrow flow (`use-fund-escrow.ts`)

This is the most complex hook. The logic is identical to the current `use-buy-product.ts` but reads data from the Escrow entity:

```ts
// 1. Get pubkeys
const sellerPubkeyBytes = hex.decode(sellerPubkey); // from escrow.seller.pubkey
const buyerPubkeyBytes = await wallet.identity.compressedPublicKey();
const info = await arkProvider.getInfo();
const serverPubkeyBytes = hex.decode(info.signerPubkey);

// 2. Convert all to x-only (32 bytes)
const toXOnly = (bytes: Uint8Array) => bytes.length === 33 ? bytes.slice(1) : bytes;

// 3. Build escrow script
const refundPath = CLTVMultisigTapscript.encode({
  pubkeys: [toXOnly(buyerPubkeyBytes), toXOnly(serverPubkeyBytes)],
  absoluteTimelock: BigInt(escrow.timelockExpiry),
}).script;
const collaborativePath = MultisigTapscript.encode({
  pubkeys: [toXOnly(buyerPubkeyBytes), toXOnly(sellerPubkeyBytes), toXOnly(serverPubkeyBytes)],
}).script;
const escrowScript = new VtxoScript([refundPath, collaborativePath]);
const escrowAddress = escrowScript.address("tark", toXOnly(serverPubkeyBytes)).encode();

// 4. Send BTC
await wallet.sendBitcoin({ address: escrowAddress, amount: escrow.value });

// 5. Check payment
await fetch(`${API_BASE_URL}/escrows/${escrow.id}/check-payment`, { headers });
```

**Important**: The `timelockExpiry` is already set on the Escrow (it was provided when the buyer accepted the offer in task 05). Do NOT recompute it here — read `escrow.timelockExpiry`.

### Escrow action section in chat detail

Render below the message thread, above the input bar. Use a `Card` component with conditional action buttons based on:
- `escrow.status` — determines which actions are available
- `isSeller` / `isBuyer` — determines who sees which buttons
- `timelockExpired` — for refund eligibility (same check as current: `isAfter(new Date(), escrow.timelockExpiry * 1000)`)

Pattern for role detection (reuse from task 05's chat detail):
```ts
const isSeller = userPubkey === chat.product?.seller?.pubkey;
const isBuyer = userPubkey === chat.buyer?.pubkey;
```

### Query invalidation

After any escrow mutation succeeds, invalidate:
```ts
queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
queryClient.invalidateQueries({ queryKey: ["escrow", escrowId] });
```

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Use NativeWind + TailwindCSS for styling; do not use inline StyleSheet unless unavoidable
- Do not modify Gluestack base components in `components/ui/`
- Keep changes minimal and focused on the task
- Preserve all existing Ark protocol logic exactly — only change where data is read/written and which URLs are called
