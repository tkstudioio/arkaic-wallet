# Task: Role-based actions on product detail page

## Context

The Arkaic Wallet ecommerce feature uses a collaborative escrow flow with two roles: **seller** and **buyer**. The product detail page (`components/product-details.tsx`) currently shows ALL action buttons to every user regardless of their role. This means a seller sees buyer actions and vice versa.

**How the role is determined:**
- The current user's compressed public key is available via `wallet.identity.compressedPublicKey()` from the Zustand store (`useAccountStore` in `stores/account.ts`). This returns a `Uint8Array` that must be converted to a hex string.
- The `Product` type (`types/product.ts`) has `sellerPubkey` (always set) and `buyerPubkey` (set after a purchase).
- If `currentUserPubkey === product.sellerPubkey` → user is the **seller**.
- If `currentUserPubkey === product.buyerPubkey` → user is the **buyer**.
- If neither matches and `product.status === "awaitingFunds"` → user is a potential buyer who can purchase.

**Existing patterns:**
- `hooks/products/use-buy-product.ts` already calls `wallet.identity.compressedPublicKey()` and converts to hex — use the same pattern.
- The `useAccountStore` hook provides `wallet` from the store: `const { wallet } = useAccountStore()`.
- Hex conversion pattern used in `use-buy-product.ts`: `Buffer.from(await wallet.identity.compressedPublicKey()).toString("hex")`.

**Typography components:** Use `H1`, `P`, `Large`, `Small`, `Muted` from `@/components/ui/typography`.

**Styling:** NativeWind + TailwindCSS utility classes via `className` prop.

## Goal

Refactor `components/product-details.tsx` so that:

1. The current user's pubkey is resolved on mount (via a `useState` + `useEffect` or similar approach).
2. Action buttons are conditionally rendered based on whether the user is the seller or the buyer.
3. The "Buy" button is only shown to users who are **not** the seller (i.e., potential buyers).
4. After purchase, seller actions are only visible to the seller, buyer actions only to the buyer.

## Acceptance Criteria

- [ ] Current user's pubkey is derived from `wallet.identity.compressedPublicKey()` and stored as hex string
- [ ] When `product.status === "awaitingFunds"`: the "Buy" button is shown only if the current user is **not** the seller
- [ ] When `product.status === "awaitingFunds"` and the user **is** the seller: show an informational message (e.g., "Waiting for a buyer…") instead of the Buy button
- [ ] When status is not `"awaitingFunds"` and the user is the **seller**: show only "Seller - sign collaborate" and "Seller - sign checkpoints" buttons
- [ ] When status is not `"awaitingFunds"` and the user is the **buyer**: show only "Buyer - confirm collaborate" and "Buyer - claim refund" (with existing timelock check) buttons
- [ ] If the user is neither seller nor buyer (edge case): show no action buttons
- [ ] No changes to hooks or types — only `components/product-details.tsx` is modified

## Files to Create or Modify

- `components/product-details.tsx` — Add role detection logic and conditional rendering of action buttons

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Use NativeWind + TailwindCSS for styling; do not use inline StyleSheet
- Do not modify Gluestack base components in `components/ui/`
- Keep changes minimal and focused on the task
- The `compressedPublicKey()` call is async — handle it properly (e.g., `useEffect` + `useState`)
