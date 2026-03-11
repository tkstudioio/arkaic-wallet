# Task 05 — Chat & Counter-offer System — Review Handoff

## Touched Files

### Created
- `hooks/chats/use-product-chats.ts` — Query hook for product chats list
- `hooks/chats/use-chat.ts` — Query hook for single chat detail (5s refetch)
- `hooks/chats/use-open-chat.ts` — Mutation hook to open/resume chat
- `hooks/chats/use-send-message.ts` — Mutation hook to send message/offer
- `hooks/chats/use-accept-offer.ts` — Mutation hook to accept offer and create escrow
- `app/chats/_layout.tsx` — Chat screens layout (same pattern as products)
- `app/chats/[chatId].tsx` — Chat detail screen with messages, offers, input bar
- `components/chat-message-item.tsx` — Renders text bubbles and offer cards
- `components/chat-list-item.tsx` — Renders chat preview for product detail

### Modified
- `types/product.ts` — Added `product?` field and `escrow?: Escrow | null` to `ProductChat`
- `app/products/[id].tsx` — Added chat section: seller sees chat list, buyer sees "Chat with seller" button

## Summary of Changes

- All 5 chat hooks follow existing patterns (React Query, `getAuthHeaders`, `API_BASE_URL`)
- Chat detail screen features: inverted FlatList for messages, sender-aligned bubbles, offer cards with price proposal styling, text+offer input bar, accept button for buyer
- Product detail page now shows chat integration: seller views all buyer chats, buyer can open/resume their chat
- Query invalidation on mutations ensures UI stays fresh

## Test Flow

1. As seller: create a product, view product detail → no chats shown
2. As buyer: view a product → "Chat with seller" button appears → tap to open chat → navigate to chat detail
3. In chat detail: send text messages, toggle offer input to send price proposals
4. As seller: view product detail → see buyer chat in list → tap to open chat
5. As buyer: tap "Accept offer" → escrow created

## Commands Executed

- `npx tsc --noEmit` — pass (no errors in new/modified files; pre-existing Gluestack UI type errors unrelated)

## Known Limitations

- Chat does not have push notifications or real-time updates (uses 5s polling)
- Accept flow uses `subMinutes(new Date(), 5)` for timelock — same as original implementation
