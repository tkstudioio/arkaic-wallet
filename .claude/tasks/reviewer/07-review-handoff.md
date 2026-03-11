# Task 07 — Account Screens Update — Review Handoff

## Touched Files

### Created
- `components/buying-chat-item.tsx` — Chat card for buying screen with product info, escrow badge

### Modified
- `hooks/products/use-account-products.ts` — Fixed query key collision (`account-selling` / `account-buying`); renamed `useAccountBuyingProducts` to `useAccountBuyingChats` returning `ProductChat[]`; migrated from axios to fetch
- `app/account/buying.tsx` — Rewritten to display chats with `BuyingChatItem` instead of products with `ProductsListItem`

## Summary of Changes

- Fixed query key collision: selling uses `["account-selling"]`, buying uses `["account-buying"]`
- Buying screen now shows chat cards with: product name, price, seller pubkey, chat status badge, escrow status badge, last message preview
- `BuyingChatItem` links to `/chats/[chatId]` for navigation to chat detail
- Escrow status badges are color-coded (warning for awaiting, info for in-progress, success for completed, error for refunded)
- Selling screen continues to work unchanged (just query key updated)

## Test Flow

1. Navigate to "Buying" tab → see list of chats (not products)
2. Each chat card shows: product name, price, seller, chat status, escrow status
3. Tap a chat → navigates to `/chats/[chatId]`
4. Navigate to "Selling" tab → still shows products correctly
5. Verify no query cache collision (selling and buying data are independent)

## Commands Executed

- `npx tsc --noEmit` — pass (no errors in new/modified files)

## Known Limitations

- Empty state shows "No active negotiations." text (no illustration/CTA)
