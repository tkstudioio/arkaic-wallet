# Task: Fix Collaborative Checkpoint Signing Hooks

## Context

The Arkaic Wallet has an e-commerce escrow system where a buyer locks funds into a multisig escrow and the seller collaboratively releases them. The backend endpoints for the collaborative flow have been restructured. The frontend hooks must be updated to match.

### Stack & Conventions

- React Native + Expo, TypeScript, React Query (`@tanstack/react-query`)
- Ark SDK: `Transaction` from `@arkade-os/sdk`, `base64` from `@scure/base`
- Wallet and arkProvider come from `useAccountStore` (Zustand store at `stores/account.ts`)
- API base URL: `http://localhost:3000`
- HTTP client: `axios`
- All code and comments in English
- Conventional Commits, no AI attribution

### Backend Changes Summary

**`POST /products/:id/collaborate`** (changed response):
- **Before**: Saved seller-signed PSBT, set status → `sellerReady`.
- **After**: Returns `{ signedCheckpointTxs, nextStep }`. The seller must sign these checkpoint transactions and send them back via a new endpoint. Status stays `fundLocked` until checkpoints are submitted.

**`POST /products/:id/collaborate-checkpoints`** (new endpoint):
- Accepts `{ signedCheckpointTxs }` (array of base64 strings).
- Saves them and sets status → `sellerReady`.

**`POST /products/:id/confirm-collaborate`** (simplified):
- **Before**: Returned `{ arkTxid, signedCheckpointTxs }` — buyer had to sign checkpoints and call `finalize-collaborate`.
- **After**: Returns `{ success: true, arkTxid }`. Finalization happens server-side. No checkpoint signing needed from buyer.

**`POST /products/:id/finalize-collaborate`** (removed):
- Endpoint no longer exists. All finalization happens inside `confirm-collaborate`.

**Refund flow**: Unchanged.

## Goal

Update the two collaboration hooks to match the new backend API contract:

1. **Seller hook** (`use-seller-collaborate.ts`): Complete the flow — after receiving `signedCheckpointTxs` from the `collaborate` endpoint, sign each checkpoint transaction and POST them to the new `collaborate-checkpoints` endpoint.

2. **Buyer hook** (`use-buyer-collaborate.ts`): Simplify the flow — `confirm-collaborate` now returns final `{ success, arkTxid }` directly. Remove the checkpoint signing step and the call to the deleted `finalize-collaborate` endpoint.

## Acceptance Criteria

- [ ] `useSellerCollaborate` sends signed PSBT to `POST /:id/collaborate`, receives `signedCheckpointTxs`, signs each checkpoint with `wallet.identity.sign()`, and POSTs the signed checkpoints to `POST /:id/collaborate-checkpoints`
- [ ] `useSellerCollaborate` returns the response from `collaborate-checkpoints`
- [ ] `useBuyerCollaborate` sends signed PSBT to `POST /:id/confirm-collaborate` and returns the response directly (no checkpoint signing, no `finalize-collaborate` call)
- [ ] No references to the removed `finalize-collaborate` endpoint remain in the codebase
- [ ] No commented-out dead code remains in either hook
- [ ] `useRefund` hook is NOT modified (refund flow is unchanged)

## Files to Create or Modify

- `hooks/products/use-seller-collaborate.ts` — Complete the seller collaboration flow: uncomment/rewrite steps 2-3 to sign checkpoints and POST to the new `collaborate-checkpoints` endpoint
- `hooks/products/use-buyer-collaborate.ts` — Simplify: remove checkpoint signing (steps 2-3) and the `finalize-collaborate` call; return `confirm-collaborate` response directly

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Keep changes minimal and focused on the two hooks
- Do not modify `use-refund.ts`, `use-buy-product.ts`, `use-product.ts`, or any component files
- Do not modify Gluestack base components in `components/ui/`
- Signing pattern: `base64.decode → Transaction.fromPSBT → wallet.identity.sign → base64.encode(signed.toPSBT())` — this pattern is already used in both hooks and in `use-refund.ts`

## Reference: Expected Hook Logic

### `useSellerCollaborate` (complete flow)

```
1. GET  /products/:id/collaborate-psbts  → { collaboratePsbt }
2. Sign collaboratePsbt with wallet.identity.sign()
3. POST /products/:id/collaborate        → { signedCheckpointTxs }
4. Sign each checkpoint tx with wallet.identity.sign()
5. POST /products/:id/collaborate-checkpoints  → response
6. Return response
```

### `useBuyerCollaborate` (simplified flow)

```
1. GET  /products/:id/collab-status         → { collaboratePsbt }
2. Sign collaboratePsbt with wallet.identity.sign()
3. POST /products/:id/confirm-collaborate   → { success, arkTxid }
4. Return response (done — no more steps)
```
