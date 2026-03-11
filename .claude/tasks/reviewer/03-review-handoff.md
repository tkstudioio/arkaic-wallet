# Task 03 — Bearer Auth All Endpoints — Review Handoff

## Touched Files

| File | Change |
|------|--------|
| `utils/get-pubkey-hex.ts` | **Created** — shared helper that derives compressed pubkey hex from a `Wallet` instance |
| `hooks/products/use-products.ts` | Replaced inline pubkey derivation with `getPubkeyHex()` helper |
| `hooks/products/use-product.ts` | Added wallet from store + Bearer header (was missing auth entirely) |
| `hooks/products/use-account-products.ts` | Replaced inline pubkey derivation with `getPubkeyHex()` helper in both hooks |
| `hooks/products/use-create-product.ts` | Added Bearer header, removed `sellerPubkey` from `CreateProductParams`, derives pubkey internally |
| `hooks/products/use-buy-product.ts` | Added Bearer header to `check-payment` GET request |
| `hooks/products/use-seller-sign-collaborate.ts` | Added Bearer header to both GET and POST requests |
| `hooks/products/use-seller-sign-checkpoints.ts` | Added Bearer header to both GET and POST requests |
| `hooks/products/use-buyer-confirm-collaborate.ts` | Added Bearer header to all three requests (GET + 2 POSTs) |
| `hooks/products/use-refund.ts` | Added Bearer header to all three requests (GET + 2 POSTs) |
| `app/products/create.tsx` | Removed `sellerPubkey` state, `useEffect` derivation, and prop from mutation call |

## Test Flow

1. **Create product**: Navigate to `/products/create`, fill name + price, submit. Verify the POST request includes `Authorization: Bearer <pubkey>` header and no `sellerPubkey` in the body.
2. **List products**: Navigate to `/products`. Verify GET `/products` still includes Bearer header.
3. **Product detail**: Open a product. Verify GET `/products/:id` now includes Bearer header.
4. **Account products**: Navigate to selling/buying tabs. Verify Bearer headers are present.
5. **Buy product**: Trigger a purchase. Verify `check-payment` GET includes Bearer header.
6. **Collaborate flows**: Test seller-sign and buyer-confirm flows. Verify all requests include Bearer headers.
7. **Refund flow**: Trigger a refund. Verify all three requests include Bearer headers.

## Commands Executed

- `npx tsc --noEmit` — pass (no errors in changed files; pre-existing errors in Gluestack UI base components only)

## Known Limitations

- None. All acceptance criteria met.
