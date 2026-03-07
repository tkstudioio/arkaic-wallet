# Task: Bottom Tab Navigation Menu

## Context

The app uses `AppLayout` (`components/layouts/app-layout.tsx`) as the shared layout wrapper for authenticated screens. It provides a top header bar with a logo and hamburger menu, wraps children in a `QueryClientProvider`, and renders modals/drawers.

Currently there is no bottom navigation. The `AppLayout` renders its children inside a `View` with `flex-1` and a top `VStack`. Pages that use `AppLayout` include `app/dashboard.tsx` (wallet) and `app/products/index.tsx` (products).

The root layout (`app/_layout.tsx`) uses a simple `<Stack>` navigator from expo-router with headers hidden.

**Key files:**

- `components/layouts/app-layout.tsx` — shared layout for authenticated screens
- `app/_layout.tsx` — root layout with `Stack` navigator
- `app/dashboard.tsx` — wallet page (uses `AppLayout`)
- `app/products/index.tsx` — products list page (uses `AppLayout`)
- `components/ui/button/index.tsx` — existing Button component
- `components/ui/typography/index.tsx` — `H1`, `P`, `Large`, `Small`, `Muted` components

**Styling conventions:**

- NativeWind + TailwindCSS utility classes
- `bg-arkaic-background` for background color
- Font: Ubuntu Mono only (`font-heading` for bold, `font-body` for regular)
- Lucide React Native for icons

## Goal

Add a fixed bottom tab bar to `AppLayout` with two buttons: **Wallet** and **Products**. The tab bar should:

1. Be rendered at the bottom of the `AppLayout`, below the children content area
2. Highlight the active tab based on the current route
3. Navigate to `/dashboard` when "Wallet" is tapped and `/products` when "Products" is tapped
4. Use `lucide-react-native` icons (e.g., `Wallet` and `ShoppingBag` or `Package`)
5. Include a text label below each icon

## Acceptance Criteria

- [ ] A bottom tab bar is visible on all screens that use `AppLayout`
- [ ] The tab bar has exactly two items: "Wallet" (navigates to `/dashboard`) and "Products" (navigates to `/products`)
- [ ] Each tab item displays an icon (from lucide-react-native) and a text label
- [ ] The active tab is visually distinct from the inactive one (e.g., different text/icon color)
- [ ] Tapping a tab navigates to the correct route using expo-router
- [ ] The tab bar is fixed at the bottom and does not scroll with content
- [ ] The tab bar respects safe area insets on devices with home indicators (use `react-native-safe-area-context` if needed)
- [ ] Styling uses NativeWind classes and is consistent with the existing design (dark background, Ubuntu Mono font)

## Files to Create or Modify

- `components/navigation-menu.tsx` — create a new standalone component for the bottom tab bar. It must handle route detection, navigation, icon rendering, and active state styling.
- `components/layouts/app-layout.tsx` — import and render `<NavigationMenu />` inside `AppLayoutContent`, below the main content `View` and above the modals/drawers.

## Constraints

- Follow Conventional Commits (no AI attribution in commit messages)
- All code and comments in English
- Use NativeWind + TailwindCSS for styling; do not use inline StyleSheet unless unavoidable
- Do not modify Gluestack base components in `components/ui/` unless explicitly required
- Keep changes minimal and focused on the task
- Use `usePathname()` or `useSegments()` from `expo-router` to determine the active route
- Use `useRouter()` from `expo-router` for navigation (already imported in the file)
