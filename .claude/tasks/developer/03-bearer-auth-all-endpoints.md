# Task: Add Bearer token authentication to all product endpoints

## Context

The ecommerce feature uses product hooks in `hooks/products/` to communicate with a backend at `http://localhost:4000`. Currently, only some query hooks send the user's compressed public key as a `Bearer` token in the `Authorization` header. Mutation hooks and several GET endpoints do not send any authentication.

The public key is derived from the Ark wallet identity:

```typescript
const pubkeyBytes = await wallet.identity.compressedPublicKey(); // Uint8Array, 33 bytes
const pubkey = Array.from(pubkeyBytes)
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");
// Result: hex string of the compressed pubkey (66 chars)
```

The wallet instance is available from the Zustand store: `useAccountStore()`.

### Current state of each hook

| Hook file                          | Endpoints                                                                               | Has Bearer? |
| ---------------------------------- | --------------------------------------------------------------------------------------- | ----------- |
| `use-products.ts`                  | `GET /products`                                                                         | YES         |
| `use-product.ts`                   | `GET /products/:id`                                                                     | NO          |
| `use-account-products.ts`          | `GET /account/selling`, `GET /account/buying`                                           | YES         |
| `use-create-product.ts`            | `POST /products`                                                                        | NO          |
| `use-buy-product.ts`               | `GET /products/:id/check-payment`                                                       | NO          |
| `use-seller-sign-collaborate.ts`   | `GET .../seller-psbt`, `POST .../seller-submit-psbt`                                    | NO          |
| `use-seller-sign-checkpoints.ts`   | `GET .../seller-checkpoints`, `POST .../seller-sign-checkpoints`                        | NO          |
| `use-buyer-confirm-collaborate.ts` | `GET .../buyer-psbt`, `POST .../buyer-submit-psbt`, `POST .../buyer-sign-checkpoints`   | NO          |
| `use-refund.ts`                    | `GET .../refund/psbt`, `POST .../refund/submit-signed-psbt`, `POST .../refund/finalize` | NO          |

### HTTP client inconsistency

Some hooks use raw `fetch`, others use `axios`. Both are present in the codebase.

## Goal

1. **Every HTTP request** to the backend must include the `Authorization: Bearer <compressedPubkeyHex>` header.
2. Extract the pubkey-derivation logic into a shared helper to avoid duplicating the same 4-line snippet in every hook.
3. Remove the `sellerPubkey` field from the `POST /products` request body — the backend should derive the seller identity from the Bearer token instead.
4. use axios anywhere. You should create an axios instance containing the baseUrl somwhere in lib directory. Then use that axios instance everywhere. The axios instance should generate the pubkey and send it to the backend via bearer tokenw

## Acceptance Criteria

- [ ] A shared async helper exists that returns the compressed pubkey hex string from a `Wallet` instance (e.g. `utils/get-pubkey-hex.ts` or similar)
- [ ] All hooks in `hooks/products/` use this helper instead of inline derivation
- [ ] Every `fetch` and `axios` call to the backend includes `Authorization: Bearer <pubkey>` in headers
- [ ] `use-create-product.ts`: the `CreateProductParams` type no longer includes `sellerPubkey`; the hook derives the pubkey internally and sends it only via the Bearer header
- [ ] `app/products/create.tsx`: no longer derives `sellerPubkey` in a `useEffect` or passes it to the mutation — the form only sends `nome` and `prezzo`
- [ ] `use-product.ts`: now requires the wallet from the store and sends the Bearer header
- [ ] `use-buy-product.ts`: the `check-payment` GET request includes the Bearer header
- [ ] All hooks in the collaborate/refund flows include the Bearer header on every request (GET and POST)
- [ ] No functional regressions — the hooks still return the same data / call the same endpoints

## Files to Create or Modify

- **Create** `utils/get-pubkey-hex.ts` — shared helper: `export async function getPubkeyHex(wallet: Wallet): Promise<string>`
- **Modify** `hooks/products/use-products.ts` — use helper, keep existing Bearer header
- **Modify** `hooks/products/use-product.ts` — add wallet from store, add Bearer header
- **Modify** `hooks/products/use-account-products.ts` — use helper, keep existing Bearer header
- **Modify** `hooks/products/use-create-product.ts` — add Bearer header, remove `sellerPubkey` from params, derive internally
- **Modify** `hooks/products/use-buy-product.ts` — add Bearer header to the `check-payment` GET request
- **Modify** `hooks/products/use-seller-sign-collaborate.ts` — add Bearer header to both requests
- **Modify** `hooks/products/use-seller-sign-checkpoints.ts` — add Bearer header to both requests
- **Modify** `hooks/products/use-buyer-confirm-collaborate.ts` — add Bearer header to all three requests
- **Modify** `hooks/products/use-refund.ts` — add Bearer header to all three requests
- **Modify** `app/products/create.tsx` — remove `sellerPubkey` state, `useEffect` derivation, and prop from mutation call

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Do not modify Gluestack base components in `components/ui/`
- Keep changes minimal and focused on the task
- Preserve existing `fetch` vs `axios` usage in each hook (do not migrate one to the other in this task)
- The helper must accept a `Wallet` instance as parameter (import the type from `@arkade-os/sdk`)
