# Task: Restyle system messages in chat UI

## Context

The backend already writes system messages into the chat (messages with `isSystem: true`). These messages are currently rendered as a simple centered `Muted` text in `components/message.tsx` (lines 16-23). The product team wants a more structured visual treatment using a card layout with a clear timestamp and message body.

## Objective

Replace the current system message rendering in `MessageComponent` with a card-based layout that uses:
- A `Card` component with `variant="outline"` and `className="w-max"`
- A `Small` component displaying the timestamp in `YYYY/MM/DD HH:mm` format (with leading zeros)
- A `P` component displaying the system message content

The card should be horizontally centered in the chat, consistent with the fact that system messages belong to neither the buyer nor the seller.

## File to modify

- `/Users/micheleguidetti/Desktop/progetti/tkstudio/arkaic-wallet/components/message.tsx`

## Implementation

In `components/message.tsx`, replace the entire render logic (the existing `if` blocks) with a single `match` from `ts-pattern`. Add `import { match } from 'ts-pattern'` at the top of the file.

The component currently uses early-return `if` statements. Replace the whole return logic with:

```tsx
import { match } from 'ts-pattern';

// inside the component:
return match(props.message)
  .with({ isSystem: true }, (msg) => (
    <Card variant="outline" className="w-max self-center">
      <Small>
        {format(new Date(msg.sentAt), "yyyy/MM/dd HH:mm")}
      </Small>
      <P>{msg.message}</P>
    </Card>
  ))
  .otherwise((msg) => (
    // existing non-system message JSX here, unchanged
  ));
```

If the existing non-system rendering is already complex (e.g. nested conditions for offer messages), you may keep a nested `match` inside `.otherwise()` — but every `match` block must end with `.otherwise()`.

Key details:
1. **ts-pattern**: always use `match(...).with(...).otherwise()` — never bare `if/else` for conditional rendering.
2. **Card variant**: use `variant="outline"` -- this applies the `border border-arkaic-border` style (see `components/ui/card/styles.tsx` line 11). The Card already includes `gap-arkaic-md` in its base styles, so spacing between `Small` and `P` is handled automatically.
3. **Width**: `w-max` makes the card shrink-wrap to content width.
4. **Centering**: `self-center` centers the card horizontally within the parent `VStack` (which uses `space={"md"}` in `app/chats/[id].tsx` line 80).
5. **Timestamp format**: changed from `dd/MM/yyyy HH:mm` to `yyyy/MM/dd HH:mm` per requirements. The `date-fns` `format` function already produces leading zeros for these tokens.
6. **Typography**: `Small` for the timestamp (14px regular), `P` for the message body (16px regular).

Imports needed: add `import { match } from 'ts-pattern'`. `Card`, `P`, and `Small` are already imported. The `Muted` import becomes unused and should be removed.

## Constraints

- Use `match` from `ts-pattern` for all conditional rendering — every `match` must end with `.otherwise()`
- Do NOT change the rendering of regular (non-system) messages
- Do NOT change the `key` prop logic in the parent screen (even though `message.signature` may be null for system messages -- that is a separate concern)
- Use `@/` path alias for all imports
- Follow existing code style: single quotes for JSX string props, NativeWind for styling
- Remove unused `Muted` import after the refactor

## Acceptance criteria

- System messages render inside an outline card with `w-max` width, centered in the chat
- The timestamp displays in `YYYY/MM/DD HH:mm` format (e.g., `2026/03/17 14:05`)
- The message content displays below the timestamp using `P` typography
- Regular user messages and offer messages are unaffected
- No TypeScript errors

## Notes for reviewer

- Verify that `match` from `ts-pattern` is used (not `if/else`) and that every `match` ends with `.otherwise()`.
- Verify that `self-center` works correctly inside the parent `VStack` in `app/chats/[id].tsx` -- the VStack uses `space={"md"}` which should not interfere with horizontal alignment.
- Confirm the `Muted` import has been removed (it is unused after the refactor).
- The `message.signature` key issue for system messages (potentially `null`) is a pre-existing concern and out of scope.
