# Task 04 — Review Handoff

## Touched Files

### Created
- `lib/api.ts` — Centralized API base URL constant and `getAuthHeaders(wallet)` helper

### Modified
- `types/product.ts` — Full rewrite: new types (`Product`, `Account`, `ProductChat`, `ChatMessage`, `Escrow`, `EscrowStatus`, `ChatStatus`, `ProductEvent`) matching backend Prisma schema
- `hooks/products/use-products.ts` — Uses `API_BASE_URL` and `getAuthHeaders` from `@/lib/api`
- `hooks/products/use-product.ts` — Uses `API_BASE_URL` and `getAuthHeaders`
- `hooks/products/use-create-product.ts` — Uses `API_BASE_URL`, `getAuthHeaders`; params renamed `nome`→`name`, `prezzo`→`price`
- `hooks/products/use-account-products.ts` — Uses `API_BASE_URL` and `getAuthHeaders` (both selling/buying hooks)
- `hooks/products/use-buy-product.ts` — Body commented out, TODO for task 06
- `hooks/products/use-seller-sign-collaborate.ts` — Body commented out, TODO for task 06
- `hooks/products/use-seller-sign-checkpoints.ts` — Body commented out, TODO for task 06
- `hooks/products/use-buyer-confirm-collaborate.ts` — Body commented out, TODO for task 06
- `hooks/products/use-refund.ts` — Body commented out, TODO for task 06
- `app/products/create.tsx` — State variables renamed `nome`→`name`, `prezzo`→`price`
- `app/products/[id].tsx` — Stripped all escrow UI; uses `product.name`, `product.price`, `product.seller?.pubkey`; placeholder comment for task 05/06
- `app/products/index.tsx` — No changes needed (uses `ProductsListItem` component)
- `components/products-list-item.tsx` — Uses `product.name`, `product.price`, `product.seller?.pubkey`

## Test Flow

1. Verify `types/product.ts` exports all required types matching Prisma schema
2. Verify `lib/api.ts` exports `API_BASE_URL` and `getAuthHeaders`
3. Grep for `localhost:4000` — should only appear in `lib/api.ts` (within product hooks scope)
4. Grep for `.nome`, `.prezzo`, `sellerPubkey`, `buyerPubkey` in `.ts`/`.tsx` — should find zero matches
5. Verify product list screen renders `product.name` and `product.price`
6. Verify product detail screen shows name, price, seller pubkey, and activity log (no escrow buttons)
7. Verify create product screen sends `{ name, price }` payload
8. TypeScript compiles without errors on modified files

## Commands Executed

- `npx tsc --noEmit` — pass (no errors in modified files; pre-existing errors in `components/ui/` Gluestack components only)
- `grep localhost:4000` — only in `lib/api.ts` and unrelated `hooks/arkade/use-create-account.ts`
- `grep .nome/.prezzo/sellerPubkey/buyerPubkey` — zero matches in `.ts`/`.tsx` files

## Known Limitations

- `hooks/arkade/use-create-account.ts` still hardcodes `http://localhost:4000` — outside scope (not a product hook)
- Stubbed hooks (`use-buy-product`, `use-seller-sign-*`, `use-buyer-confirm-*`, `use-refund`) throw "Not implemented" — will be rebuilt in task 06
