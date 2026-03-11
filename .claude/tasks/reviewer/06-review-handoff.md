# Task 06 — Escrow System — Review Handoff

## Touched Files

### Created
- `hooks/escrows/use-escrow.ts` — Query hook for escrow detail (10s refetch)
- `hooks/escrows/use-check-payment.ts` — Mutation hook for check-payment
- `hooks/escrows/use-fund-escrow.ts` — Mutation hook: build escrow script + send BTC + check-payment
- `hooks/escrows/use-seller-sign-collaborate.ts` — Mutation: seller signs collaborate PSBT
- `hooks/escrows/use-buyer-confirm-collaborate.ts` — Mutation: buyer signs collaborate + checkpoints
- `hooks/escrows/use-seller-sign-checkpoints.ts` — Mutation: seller signs checkpoints
- `hooks/escrows/use-refund.ts` — Mutation: full refund flow (PSBT + checkpoints + finalize)

### Modified
- `app/chats/[chatId].tsx` — Added escrow action section with status badge and role-based action buttons

### Deleted
- `hooks/products/use-buy-product.ts`
- `hooks/products/use-seller-sign-collaborate.ts`
- `hooks/products/use-seller-sign-checkpoints.ts`
- `hooks/products/use-buyer-confirm-collaborate.ts`
- `hooks/products/use-refund.ts`

## Summary of Changes

- Migrated all escrow hooks from product-based URLs (`/products/:id/...`) to escrow-based URLs (`/escrows/:escrowId/...`)
- All hooks use `fetch` + `getAuthHeaders` + `API_BASE_URL` (consistent with task 04 migration)
- Preserved exact Ark protocol logic: PSBT signing, checkpoint signing, escrow script building
- Fund escrow reads `timelockExpiry` from the Escrow entity (not recomputed)
- Chat detail screen shows escrow section with: status badge, Fund (buyer), Sign collaborate (seller), Confirm collaborate (buyer), Sign checkpoints (seller), Claim refund (buyer, timelock expired), terminal state labels
- All mutations invalidate both chat and escrow queries

## Test Flow

1. After buyer accepts offer in chat → escrow appears with "Awaiting funds" status
2. Buyer taps "Fund escrow" → sends BTC, checks payment → status changes to "Funds locked"
3. Seller taps "Sign collaborate" → signs PSBT → status changes to "Seller ready"
4. Buyer taps "Confirm collaborate" → signs PSBT + checkpoints → status changes
5. Seller taps "Sign checkpoints" → completes escrow → "Completed" label
6. Alternatively: buyer waits for timelock → "Claim refund" button appears → refund flow

## Commands Executed

- `npx tsc --noEmit` — pass (no errors in new/modified files)

## Known Limitations

- No error toasts/modals for failed escrow operations (errors logged to console)
- Refund timelock check uses client-side time comparison
