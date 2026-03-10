# Review Handoff — Task 03: Role-based actions on product detail page

## Touched Files

- `components/product-details.tsx`

## Summary of Changes

### `components/product-details.tsx`

- Added imports: `useAccountStore`, `hex` from `@scure/base`, `useState`/`useEffect` from React, `Muted` typography component
- Added `userPubkey` state derived from `wallet.identity.compressedPublicKey()` via `useEffect`
- Computed `isSeller` and `isBuyer` booleans by comparing `userPubkey` against `product.sellerPubkey` and `product.buyerPubkey`
- **awaitingFunds status**: seller sees "Waiting for a buyer…" message; non-sellers see the Buy button
- **Other statuses**: seller sees only "sign collaborate" and "sign checkpoints" buttons; buyer sees only "confirm collaborate" and "claim refund" (with timelock check); neither role sees no buttons

## Test Flow

1. **As seller** — create a product, navigate to its detail page:
   - When `awaitingFunds`: should see "Waiting for a buyer…" instead of Buy button
   - After purchase: should see "Seller - sign collaborate" and "Seller - sign checkpoints" buttons only
2. **As buyer** — navigate to a product created by another user:
   - When `awaitingFunds`: should see the Buy button
   - After purchase: should see "Buyer - confirm collaborate" and "Buyer - claim refund" (if timelock expired) buttons only
3. **As third party** — navigate to a product where you are neither seller nor buyer (after purchase):
   - Should see no action buttons

## Commands Executed

- `npx tsc --noEmit` — pass (no errors in `product-details.tsx`; pre-existing errors in `components/ui/actionsheet/index.tsx` are unrelated)

## Known Limitations

- The `compressedPublicKey()` returns a 33-byte compressed key; comparison works correctly only if `product.sellerPubkey` and `product.buyerPubkey` are stored as compressed pubkey hex strings (consistent with existing usage in `use-buy-product.ts`)
