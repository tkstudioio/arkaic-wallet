# Task: UI cleanup — safe area, settings page, logo fix

## Context

Arkaic is a React Native + Expo (SDK 54) mobile Bitcoin wallet. Styling uses NativeWind + TailwindCSS. Routing is file-based via expo-router in `app/`.

### Current layout structure

- **Root layout** (`app/_layout.tsx`): wraps everything in `GluestackUIProvider` + `Stack`. No `SafeAreaProvider`.
- **App layout** (`components/layouts/app-layout.tsx`): used by authenticated pages. Contains:
  - A hardcoded `pt-16` (64px) top padding to avoid the status bar — this is the main problem for point 1.
  - A header bar with `LogoFull` (left) and a hamburger menu button (right).
  - A right-side `Drawer` containing: "Backup seed phrase", "Delete account", "Sign PSBT" buttons, and a "Log out" button in the footer.
  - Three modals triggered from the drawer: backup (seed phrase grid), delete confirmation, PSBT signing.
  - `NavigationMenu` bottom tabs (currently: Wallet, Products).
- **Auth layout** (`components/layouts/auth-layout.tsx`): used by unauthenticated pages. Has a hardcoded `pt-arkaic-xl` (64px) top padding.
- **Navigation menu** (`components/navigation-menu.tsx`): bottom tab bar with 2 tabs (Wallet → `/dashboard`, Products → `/products`). Already uses `useSafeAreaInsets()` for bottom padding.
- **Logo** (`components/icons/logo.tsx`): SVG via `react-native-svg`. Has `viewBox='0 0 122 33'` with `height={33}` default, but no explicit `width`. Props are spread so callers can override. On web, it doesn't render — likely because `react-native-svg` on web needs an explicit `width` or `fill` attribute on the `<Svg>` element, or the SVG element collapses to 0 width.

### Packages already installed

- `react-native-safe-area-context` (^5.6.1) — available but `SafeAreaProvider` is NOT added to the root layout.
- `lucide-react-native` — icon library already in use.
- `expo-router` — file-based routing.

### Tailwind spacing tokens (in `tailwind.config.js`)

- `arkaic-xs`: 4px, `arkaic-sm`: 8px, `arkaic-md`: 16px, `arkaic-lg`: 32px, `arkaic-xl`: 64px

### Typography components

Import from `@/components/ui/typography`: `H1`, `P`, `Large`, `Small`, `Muted`.

### Existing patterns

- Hooks use React Query. Mutations: `useDeleteAccount` from `@/hooks/arkade/use-delete-account`.
- Account store: `useAccountStore` from `@/stores/account` — exposes `account`, `fingerprint`, `logout`.
- Seed phrase grid: `SeedPhraseGrid` from `@/components/seed-phrase-grid` — takes `words: string[]` and `isDisabled` props.
- The `Platform` API from `react-native` can detect `Platform.OS === 'web'`.

## Goal

Three improvements:

### 1. Dynamic safe-area top spacing (replace hardcoded `pt-16`)

Replace the hardcoded `pt-16` in `app-layout.tsx` (line 123) with dynamic top spacing based on `useSafeAreaInsets().top`. This ensures:
- On iOS/Android: the content respects the actual status bar / notch height.
- On web: there is no status bar, so `insets.top` is 0. Apply a small top padding equal to the horizontal padding (`arkaic-md` = 16px) for visual consistency.

Also fix the same issue in `auth-layout.tsx` (line 12) which uses `pt-arkaic-xl` (64px) as a hardcoded workaround.

To make `useSafeAreaInsets()` work, wrap the app in `SafeAreaProvider` from `react-native-safe-area-context` in the root layout (`app/_layout.tsx`).

### 2. Remove top-right menu, create Settings page

**Remove from `app-layout.tsx`:**
- The menu icon button in the header (lines 127-135).
- The entire `Drawer` component and its contents (lines 270-336).
- The "Sign PSBT" modal and all related state/logic (`showSignPsbtModal`, `psbtInput`, `psbtError`, `isSigning`, `handleSignPsbt`). This feature is no longer needed.
- The backup modal and delete modal — these will move to the Settings page.
- All unused imports after the cleanup.

**Keep in the header:** just the `LogoFull` component (left-aligned, or centered — your call for aesthetics).

**Create a new Settings page** at `app/settings/index.tsx`:
- **Important:** Do NOT use `app/account/` — that directory already exists for account creation/restore flows (`app/account/create.tsx`, `app/account/restore.tsx`). Use `app/settings/` instead to avoid route conflicts.
- This page uses `AppLayout` as its wrapper (like dashboard and products do).
- It displays the account management features that were in the drawer:
  - Account info section: account name, fingerprint.
  - "Backup seed phrase" button → opens a modal (or inline expandable) showing the `SeedPhraseGrid`.
  - "Delete account" button (negative action) → opens a confirmation modal.
  - "Log out" button (negative action).
- Use the same component patterns and styling as existing pages. Follow the design language: `VStack`, `Button`, `ButtonIcon`, `ButtonText`, Lucide icons, typography components.
- Modal logic for backup and delete can be moved here from `app-layout.tsx`.

**Add Settings tab to `NavigationMenu`:**
- Add a third tab: `{ label: "Settings", icon: SettingsIcon, path: "/settings" }` (use `Settings` from `lucide-react-native`).
- This tab appears at the end (right-most position).

### 3. Fix logo not rendering on web

The `LogoFull` component (`components/icons/logo.tsx`) likely doesn't render on web because the `<Svg>` element has a `height` but no explicit `width`, causing it to collapse. Fix by ensuring both `width` and `height` are set. The aspect ratio from the viewBox is 122:33, so compute a default width from the height (or vice versa). When callers pass both `width` and `height` via props, those should still override.

## Acceptance Criteria

- [ ] `SafeAreaProvider` wraps the app in `app/_layout.tsx`
- [ ] `app-layout.tsx` uses `useSafeAreaInsets().top` for top padding instead of `pt-16`. On web, falls back to 16px if insets.top is 0
- [ ] `auth-layout.tsx` uses `useSafeAreaInsets().top` for top padding instead of `pt-arkaic-xl`. On web, falls back to 16px
- [ ] The hamburger menu button and Drawer are removed from `app-layout.tsx`
- [ ] Sign PSBT feature (modal, state, handler) is completely removed
- [ ] Backup and Delete modals are moved to the new Settings page
- [ ] `app/settings/index.tsx` exists and shows: account info, backup seed phrase, delete account, log out
- [ ] `NavigationMenu` has 3 tabs: Wallet, Products, Settings
- [ ] `LogoFull` renders correctly on web (explicit width + height)
- [ ] No unused imports or dead code left behind
- [ ] App compiles and runs without errors

## Files to Create or Modify

- `app/_layout.tsx` — wrap with `SafeAreaProvider`
- `components/layouts/app-layout.tsx` — replace `pt-16` with dynamic insets, remove drawer/menu/modals/PSBT logic
- `components/layouts/auth-layout.tsx` — replace `pt-arkaic-xl` with dynamic insets
- `app/settings/index.tsx` — **create**: new Settings page with backup, delete, logout
- `components/navigation-menu.tsx` — add Account tab
- `components/icons/logo.tsx` — add default `width` computed from aspect ratio

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Use NativeWind + TailwindCSS for styling; do not use inline StyleSheet unless unavoidable (dynamic `paddingTop` from insets is an acceptable exception)
- Do not modify Gluestack base components in `components/ui/` unless explicitly required
- Keep changes minimal and focused on the task
