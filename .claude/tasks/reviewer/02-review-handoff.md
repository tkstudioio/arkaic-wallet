# Review Handoff — 02-reflow

## Touched Files

- `hooks/products/use-seller-sign-collaborate.ts` — new hook (replaces old `useSellerCollaborate`)
- `hooks/products/use-seller-sign-checkpoints.ts` — new hook for seller's checkpoint signing step
- `hooks/products/use-buyer-confirm-collaborate.ts` — new hook for buyer to co-sign and trigger submitTx
- `hooks/products/use-seller-collaborate.ts` — deleted (old hook)
- `hooks/products/use-buyer-collaborate.ts` — deleted (old hook)
- `hooks/products/use-product.ts` — updated (polling interval added)
- `components/product-details.tsx` — updated imports and buttons for new hooks

## Summary of Changes

### New: `useSellerSignCollaborate`
Seller-only step: GET `/collaborate-psbts` → decode PSBT → sign → POST `/collaborate`. No `submitTx`.

### New: `useBuyerConfirmCollaborate`
Buyer step: GET `/collab-status` → decode seller-signed PSBT → add buyer signature → POST `/confirm-collaborate` (triggers `submitTx`) → sign returned checkpoints → POST `/buyer-sign-checkpoints`.

### New: `useSellerSignCheckpoints`
Seller's second step: GET `/collab-checkpoints` → decode each checkpoint PSBT → sign all → POST `/collaborate-checkpoints`. Triggers `finalizeTx` on backend.

### Deleted: `useSellerCollaborate`, `useBuyerCollaborate`
Old single-shot hooks replaced by the three new hooks above.

## Test Flow

1. **Seller signs collaborate**: Open product details as seller → press "Seller - sign collaborate" → should call `/collaborate-psbts` then POST to `/collaborate`
2. **Buyer confirms**: Open product details as buyer → press "Buyer - confirm collaborate" → should call `/collab-status` → POST to `/confirm-collaborate` → sign returned checkpoints → POST to `/buyer-sign-checkpoints`
3. **Seller signs checkpoints**: After buyer confirms → press "Seller - sign checkpoints" → should call `/collab-checkpoints` then POST to `/collaborate-checkpoints`

## Commands Executed

- `npx tsc --noEmit` — all errors are pre-existing in `components/ui/` (Gluestack base), no errors in new/changed files
- `grep` for old hook references — no stale imports found

## Known Limitations

- Hooks don't implement polling/retry for status checks (e.g., buyer calling `/collab-status` before seller has signed). The UI currently relies on manual button presses.
- `useProduct` polls every 1s to keep status up to date, which is functional but may need tuning.
