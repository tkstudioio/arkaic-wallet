# Task 08 — Counter-offer send menu — Review Handoff

## Touched Files

- `app/products/[id].tsx`

## Changes

### `app/products/[id].tsx`

- **New imports**: `Menu`, `MenuItem`, `MenuItemLabel` from `@/components/ui/menu`; `Modal`, `ModalBackdrop`, `ModalBody`, `ModalContent`, `ModalFooter`, `ModalHeader` from `@/components/ui/modal`; `Heading` from `@/components/ui/heading`
- **New state**: `showCounterOfferModal` (boolean), `offerPrice` (string)
- **Updated `handleSend`**: Now accepts an optional `counterOffer?: number` parameter. Passes `offerPrice` to both `sendMessage` and `openChat` hooks. On success, clears text, offerPrice, and closes the modal.
- **Replaced send Button** with a `Menu` component (placement `top end`) that uses the send button as trigger. Menu has two items:
  - "Invia" — calls `handleSend()` without counter-offer
  - "Invia con contro offerta" — opens the counter-offer modal
- **Added Modal** for counter-offer input: numeric `InputField` for price in sats, "Conferma" button that calls `handleSend(Number(offerPrice))`. Disabled when offerPrice or text is empty, or mutation is pending.

## Test Flow

1. Navigate to a product detail page
2. Type a message in the text input
3. Press the send (arrow) button → a **Menu** should appear with two options
4. Press **"Invia"** → message sends normally, input clears, menu closes
5. Type another message, press send button again
6. Press **"Invia con contro offerta"** → menu closes, a **Modal** opens
7. Enter a price in sats in the numeric input
8. Press **"Conferma"** → message sends with `offerPrice`, input clears, modal closes
9. Verify the message appears with the offer price in the chat thread
10. Repeat steps 2-9 when no chat exists yet (first message creates a new chat via `openChat`)
11. Verify button is disabled when text input is empty

## Validation

- `npx eslint app/products/[id].tsx` — pass (no errors)

## Known Limitations

- The Menu trigger uses Gluestack's popover-based menu which may have positioning quirks on different screen sizes. Test on both iOS and Android.
- The `onSubmitEditing` on the text input calls `handleSend()` directly (sends without counter-offer), which is the expected keyboard submit behavior.
