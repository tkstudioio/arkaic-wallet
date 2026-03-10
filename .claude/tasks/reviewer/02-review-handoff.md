# Review Handoff — Task 02: UI cleanup, safe area, settings page

## Touched Files

| File | Action | Summary |
|------|--------|---------|
| `app/_layout.tsx` | Modified | Wrapped app in `SafeAreaProvider` |
| `components/layouts/app-layout.tsx` | Modified | Replaced `pt-16` with dynamic `useSafeAreaInsets().top`; removed drawer, menu button, all modals (backup, delete, PSBT), and related state/imports |
| `components/layouts/auth-layout.tsx` | Modified | Replaced `pt-arkaic-xl` with dynamic `useSafeAreaInsets().top`; web fallback to 16px |
| `app/settings/index.tsx` | Created | New Settings page with account info, backup seed phrase modal, delete account modal, and logout button |
| `components/navigation-menu.tsx` | Modified | Added Settings tab (3rd tab) with `Settings` icon from lucide |
| `components/icons/logo.tsx` | Modified | Added computed default `width` from aspect ratio (122/33) so SVG renders on web |

## Test Flow

1. **Safe area (iOS/Android)**: Open app on device — content should respect status bar/notch without overlap. No hardcoded 64px gap.
2. **Safe area (web)**: Open app on web — should have 16px top padding (no status bar).
3. **Header**: Only the logo should appear in the header; no hamburger menu icon.
4. **Bottom tabs**: Should show 3 tabs: Wallet, Products, Settings.
5. **Settings page**: Navigate to Settings tab:
   - Account name and fingerprint displayed
   - "Backup seed phrase" button opens modal with seed phrase grid
   - "Delete account" button opens confirmation modal; confirming deletes and redirects to landing
   - "Log out" button logs out and redirects to landing
6. **Logo on web**: Logo should render visibly on web (not collapsed to 0 width).
7. **Auth pages**: Login/create/restore pages should have dynamic top spacing, not hardcoded 64px.

## Commands Executed

- `npx tsc --noEmit` — pass (no new errors; pre-existing errors in `components/ui/` only)

## Known Limitations

- None
