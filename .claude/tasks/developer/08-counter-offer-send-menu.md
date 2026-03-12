# Task: Counter-offer send menu on product detail page

## Context

The product detail page (`app/products/[id].tsx`) currently has a simple send button that sends a text message. The send flow uses two hooks depending on whether a chat already exists:

- `useOpenChat()` — creates a new chat with an initial message (`POST /products/{productId}/chats` with `{ text, offerPrice }`)
- `useSendMessage()` — sends a message to an existing chat (`POST /chats/{chatId}/messages` with `{ text, offerPrice }`)

Both hooks already support an optional `offerPrice` parameter. The API is ready — no backend changes needed.

### Existing UI components to use

- **Menu** (`@/components/ui/menu`): Gluestack popover-style menu with `Menu`, `MenuItem`, `MenuItemLabel`. It uses `@gluestack-ui/core/menu/creator` which requires a `trigger` prop (render prop receiving `{ handleOpen }`) and `isOpen`/`onClose` state. The Menu renders as an animated overlay anchored near the trigger.
- **Modal** (`@/components/ui/modal`): Gluestack modal dialog with `Modal`, `ModalBackdrop`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`, `ModalCloseButton`. Requires `isOpen`/`onClose` props.
- **AmountComponent** (`@/components/amount`): Displays a sats amount with icon. Usage: `<AmountComponent amount={1234} size="3xl" />`. This is a **display** component only — it doesn't accept input.
- **Input** (`@/components/ui/input`): Standard text input. Use `<Input><InputField keyboardType="numeric" ... /></Input>` for the counter-offer price field (same pattern used in `app/chats/[id].tsx` line 286-293).
- **Button** (`@/components/ui/button`): With `ButtonText`, `ButtonIcon`.

### Current send button code (lines 72-81 of `app/products/[id].tsx`)

```tsx
<Button
  className='w-max'
  variant={"outline"}
  isDisabled={!text.trim() || isSending || isOpeningChat}
  onPress={handleSend}
>
  <ButtonIcon as={Send} />
</Button>
```

### Icon imports

The file already imports `Send` from `lucide-react-native`. You may also import `DollarSign` or `MessageSquare` for menu item icons if needed.

## Goal

Replace the simple send button with a **two-step flow**:

1. **Press the send button** → opens a **Menu** (popover-style) with two options:
   - **"Invia"** (Send) — sends the text message immediately (current behavior)
   - **"Invia con contro offerta"** (Send with counter-offer) — opens a Modal dialog

2. **Counter-offer Modal**:
   - Header: "Contro offerta" (or similar)
   - Body: a numeric `Input` field for the counter-offer price in sats (use `<Input><InputField keyboardType="numeric" placeholder="Prezzo in sats" ... /></Input>`)
   - Footer: a "Conferma" (Confirm) button that sends the message with `offerPrice` set to the entered value, and the `text` from the main input field
   - On success: clear the text input, clear the offer price, close the modal

Both "Invia" and "Invia con contro offerta → Conferma" must work for both flows (new chat via `openChat` and existing chat via `sendMessage`), following the same conditional logic already in `handleSend`.

## Acceptance Criteria

- [ ] Pressing the send button opens a Menu anchored near the button (not an ActionSheet)
- [ ] Menu has two items: "Invia" and "Invia con contro offerta"
- [ ] "Invia" sends the text message immediately (same as current `handleSend`) and closes the menu
- [ ] "Invia con contro offerta" closes the menu and opens a Modal dialog
- [ ] The Modal contains a numeric Input for the counter-offer price in sats
- [ ] Pressing "Conferma" in the Modal sends the message with both `text` and `offerPrice`
- [ ] After successful send (either path), the text input is cleared and the modal is closed
- [ ] The send button remains disabled when `text` is empty or a mutation is pending
- [ ] Works for both new chats (`openChat`) and existing chats (`sendMessage`)
- [ ] All labels are in Italian as specified: "Invia", "Invia con contro offerta", "Contro offerta", "Conferma"

## Files to Create or Modify

- `app/products/[id].tsx` — Replace the send `<Button>` with a `<Menu>` trigger, add Menu items, add Modal with counter-offer input, add state for `isModalOpen` and `offerPrice`, update `handleSend` to accept an optional `offerPrice` parameter

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- UI labels in Italian as specified by the feature request
- Use NativeWind + TailwindCSS for styling; do not use inline StyleSheet
- Do not modify Gluestack base components in `components/ui/`
- Keep changes minimal and focused on this single file
- Reuse existing hooks and components — no new hooks or API changes needed
