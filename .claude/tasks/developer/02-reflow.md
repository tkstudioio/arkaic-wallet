# Task: Rework frontend collaborative flow

## Context

The backend collaborative escrow flow has been restructured. The collaborative path uses a **3-of-3 MultisigTapscript** (buyer + seller + server), so `submitTx` can only be called after **both** buyer and seller have signed the PSBT. The old flow tried to submit with only the seller's signature and failed with `INVALID_SIGNATURE`.

### New backend endpoints (all under `/products/:id`)

| Endpoint                   | Method | Who calls it | What it does                                                                                                                                                  |
| -------------------------- | ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/collaborate-psbts`       | GET    | Seller       | Returns unsigned `collaboratePsbt` and `recipientAddress`                                                                                                     |
| `/collaborate`             | POST   | Seller       | Body:`{ signedPsbt }`. Saves seller-signed PSBT, sets status → `sellerReady`. Returns `{ success: true }`                                                     |
| `/collab-status`           | GET    | Buyer        | Returns `{ status, collaboratePsbt }` when `sellerReady` (the PSBT has seller's signature)                                                                    |
| `/confirm-collaborate`     | POST   | Buyer        | Body:`{ signedPsbt }` (PSBT with **both** buyer + seller sigs). Calls `submitTx`, saves server-signed checkpoints. Returns `{ arkTxid, signedCheckpointTxs }` |
| `/buyer-sign-checkpoints`  | POST   | Buyer        | Body:`{ signedCheckpointTxs }` (buyer-signed checkpoints). Saves buyer+server signed checkpoints. Returns `{ success: true }`                                 |
| `/collab-checkpoints`      | GET    | Seller       | Returns `{ status, arkTxid, checkpointTxs }` when available (after buyer signs checkpoints). Returns `{ status, checkpointTxs: null }` if not ready yet       |
| `/collaborate-checkpoints` | POST   | Seller       | Body:`{ signedCheckpointTxs }`. Calls `finalizeTx`, sets status → `payed`. Returns `{ success: true, arkTxid }`                                               |

### Tech stack

- React + TypeScript
- `@tanstack/react-query` for mutations/queries
- `@arkade-os/sdk` — `Transaction` class for PSBT parsing/signing
- `@scure/base` — `base64` for encoding/decoding
- `axios` for HTTP
- Wallet accessed via `useAccountStore()` → `{ wallet, arkProvider }`
- Signing: `wallet.identity.sign(tx)` where `tx` is a `Transaction` instance

## Goal

Replace the current `useSellerCollaborate` hook (which does everything in one shot) with the correct multi-step flow split across seller and buyer.

## What to create

### 1. Seller hook: `useSellerSignCollaborate`

This replaces the old `useSellerCollaborate`. It only does steps 1-2:

```typescript
// Pseudocode
async mutationFn(product: Product) {
  // 1. GET /products/:id/collaborate-psbts → { collaboratePsbt }
  // 2. Decode PSBT, sign with wallet.identity.sign(tx)
  // 3. POST /products/:id/collaborate with { signedPsbt }
  // Returns { success: true }
}
```

### 2. Seller hook: `useSellerSignCheckpoints`

New hook for the seller's second step (after buyer confirms):

```typescript
// Pseudocode
async mutationFn(product: Product) {
  // 1. GET /products/:id/collab-checkpoints → { arkTxid, checkpointTxs }
  //    (poll or call when ready)
  // 2. For each checkpoint: decode from base64, Transaction.fromPSBT(), wallet.identity.sign(), encode back
  // 3. POST /products/:id/collaborate-checkpoints with { signedCheckpointTxs }
  // Returns { success: true, arkTxid }
}
```

### 3. Buyer hook: `useBuyerConfirmCollaborate`

New hook for the buyer to add their signature, submit, and sign checkpoints:

```typescript
// Pseudocode
async mutationFn(product: Product) {
  // 1. GET /products/:id/collab-status → { collaboratePsbt } (seller-signed PSBT)
  //    (poll or call when status is sellerReady)
  // 2. Decode PSBT, sign with wallet.identity.sign(tx) — adds buyer sig on top of seller sig
  // 3. POST /products/:id/confirm-collaborate with { signedPsbt }
  //    → { arkTxid, signedCheckpointTxs }
  // 4. For each checkpoint: decode from base64, Transaction.fromPSBT(), wallet.identity.sign(), encode back
  // 5. POST /products/:id/buyer-sign-checkpoints with { signedCheckpointTxs }
  // Returns { success: true }
}
```

### 4. Delete old `useSellerCollaborate`

Remove the old hook entirely since it's replaced by the three hooks above.

## Acceptance Criteria

- [ ] `useSellerSignCollaborate` — seller signs PSBT and sends to backend (no submitTx involved)
- [ ] `useBuyerConfirmCollaborate` — buyer adds signature to seller-signed PSBT, submits (triggers `submitTx`), then signs checkpoints and sends to backend
- [ ] `useSellerSignCheckpoints` — seller retrieves checkpoints, signs them, sends back (triggers `finalizeTx` on backend)
- [ ] Old `useSellerCollaborate` hook is removed
- [ ] All hooks follow the same pattern as existing hooks (useMutation, axios, base64 encode/decode, Transaction.fromPSBT, wallet.identity.sign)

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Use `.js` extensions in all ESM imports (if applicable)
- Keep changes minimal and focused on the task
