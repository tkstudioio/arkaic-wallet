# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arkaic is a mobile Bitcoin wallet implementing the Ark protocol. Built with React Native + Expo (SDK 54), TypeScript, and the `@arkade-os/sdk` v0.3.0 by arkadeos. Supports iOS, Android, and web. **Not production-ready — no data encryption.**

## Commands

```bash
yarn install          # Install dependencies
yarn start            # Start Expo dev server
yarn android          # Start on Android
yarn ios              # Start on iOS
yarn web              # Start on web
yarn lint             # ESLint
yarn reset-project    # Reset project state
```

Node version: see `.nvmrc` (lts/jod). Use `nvm use` before running.

No test suite exists.

## Architecture

### Routing

File-based routing via **expo-router** in `app/`. Routes: `index.tsx` (home/landing), `dashboard.tsx` (main screen), `create-account.tsx`, `account/create.tsx`, `account/restore.tsx`. Root layout (`_layout.tsx`) wraps everything with Gluestack provider and crypto polyfill.

### State Management

- **Zustand** (`stores/account.ts`): Global store holding Ark SDK instances (`Wallet`, `ArkProvider`, `IndexerProvider`, `VtxoManager`, `ArkadeLightning`), current account, and UI state. The `setStore` action initializes the full Ark SDK stack from an account's private key.
- **Zustand** (`stores/settings.tsx`): Currency symbol and transaction display preferences.
- **React Query** (`@tanstack/react-query`): Server state for balance (30s poll), BTC price (15min poll), transactions, ASP info.

### Ark SDK Integration

The wallet uses three arkadeos packages:

- `@arkade-os/sdk` — Core: `Wallet`, `SingleKey`, `VtxoManager`, `ArkProvider`, `IndexerProvider`
- `@arkade-os/sdk/adapters/expo` — Expo-specific: `ExpoArkProvider`, `ExpoIndexerProvider`
- `@arkade-os/boltz-swap` — Lightning: `ArkadeLightning`, `BoltzSwapProvider` (API: `https://api.ark.boltz.exchange`)

Wallet initialization flow: `ArkaicAccount` → `SingleKey.fromHex(privateKey)` → `Wallet.create()` → setup `BoltzSwapProvider` + `ArkadeLightning` + `VtxoManager` (10% threshold).

### Hooks (`hooks/`)

All data fetching uses React Query hooks. Key patterns:

- **Query hooks**: `useBalance`, `useBitcoinPrice`, `useTransactions`, `useArkTransactions`, `useAspInfo`, `useAccounts`, `useVtxos`, `useWallet`
- **Mutation hooks**: `useCreateAccount`, `useSendBitcoin`, `useOnboardUtxos`, `usePaymentAddress`, `useDeleteAccount`
- **Utility hooks**: `useCopyToClipboard`, `usePasteFromClipboard`, `useColorScheme`, `useThemeColor`

### Payment Flow

- **Receiving**: Generates BIP21 URI (`bitcoin:<onchain>?ark=<ark_addr>&amount=<btc>`) + Lightning invoice via `ArkadeLightning`
- **Sending**: Parses BIP21 address (`utils/parse-bip21-address.ts`), determines Ark vs on-chain based on `signerPubkey` match, sends via `wallet.sendBitcoin()`
- Three payment types distinguished by colored badges: Ark (green), on-chain (orange), boarding (blue)

### Persistence

- **AsyncStorage**: Accounts array stored under key `"accounts"` (see `StorageKeys` enum in `stores/account.ts`)
- **expo-secure-store**: Available for sensitive data

### Types

- `ArkaicAccount`: `{ name, privateKey, arkadeServerUrl, avatar? }`
- `ArkaicPayment`: `{ onchainAddress?, arkAddress?, lightningInvoice?, signerPubkey?, amount? }`

### UI Stack

- **Gluestack UI** (`components/ui/`): Pre-built accessible components (Button, Input, Card, ActionSheet, Modal, etc.)
- **Nativewind + TailwindCSS**: Utility-first styling with dark mode (`class` strategy), CSS variable-based theme colors
- **React Native Skia**: QR code rendering
- **Reanimated + Legend Motion**: Animations and carousel

### Typography System

**Fonts**:

- Ubuntu Mono (`@expo-google-fonts/ubuntu-mono`): `UbuntuMono_400Regular`, `UbuntuMono_700Bold`
- Ubuntu (`@expo-google-fonts/ubuntu`): `Ubuntu_300Light`, `Ubuntu_500Medium`

Fonts are loaded in `app/_layout.tsx` via `useFonts`. The splash screen is held until fonts are ready.

**Tailwind font families** (in `tailwind.config.js`):

- `font-heading` → `UbuntuMono_700Bold`
- `font-body` / `font-mono` → `UbuntuMono_400Regular`
- `font-sans-medium` → `Ubuntu_500Medium`
- `font-sans-light` → `Ubuntu_300Light`

**Semantic typography components** (`components/ui/typography/index.tsx`):
Following the shadcn-typography factory pattern, adapted for React Native + NativeWind.

| Component | Size | Weight  | Font family          |
| --------- | ---- | ------- | -------------------- |
| `H1`      | 48px | Bold    | Ubuntu Mono          |
| `P`       | 16px | Regular | Ubuntu Mono          |
| `Large`   | 20px | Medium  | Ubuntu               |
| `Small`   | 14px | Light   | Ubuntu               |
| `Muted`   | 14px | Light   | Ubuntu (muted color) |

Usage:

```tsx
import { H1, P } from "@/components/ui/typography";
```

All components accept a `className` prop for NativeWind overrides.

### Forms

- **Formik** for `create-account-form.tsx` (account creation)
- **React Hook Form + Zod** available for other forms
- **ts-pattern** for pattern matching in conditional logic

## Commit Convention

Commits follow the **Conventional Commits** standard, compatible with `generate-changelog`. Format:

```
<type>: <description>
<type>(<category>): <description>
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`.

You should always try to split the commits into atomic commits.
One atomic commit should contain edits only from a specific type and category.

Examples:

```
feat: add QR code scanner for payments
feat(wallet): add QR code scanner for payments
fix: correct balance rounding in sats display
refactor: extract payment parsing to utility
```

Category value is not required but recommended.

**Important**: Never add "Co-Authored-By: Claude" or any AI attribution to commit messages.

## Versioning System

Arkaic integrates **automatic changelog generation** based on commits using [`generate-changelog`](https://github.com/lob/generate-changelog). The system automatically generates `CHANGELOG.md` from commit messages following the Conventional Commits standard.

### Release Commands

Release commands automatically:
1. Generate/update `CHANGELOG.md` based on commits
2. Stage and commit the changelog
3. Bump the version in `package.json` and `package-lock.json`
4. Create a git tag

**Release commands**:

```bash
yarn release:major    # Major version bump (e.g., 0.1.0 → 1.0.0)
yarn release:minor    # Minor version bump (e.g., 0.1.0 → 0.2.0)
yarn release:patch    # Patch version bump (e.g., 0.1.0 → 0.1.1)
```

**Manual changelog generation** (without version bump):

```bash
yarn changelog        # Generate changelog from commits
```

### How It Works

- **`feat` commits** → `## Features` section
- **`fix` commits** → `## Fixes` section
- **`refactor`, `style`, `perf`, etc.** → grouped by type
- **Breaking changes** (indicated by `!` before `:`) → highlighted in changelog

Example:
```
feat(ui): add dark mode support
fix!: change API response format (breaking change)
```

The changelog is automatically included in git history, making version history transparent and reproducible.

## Language

All code, comments, and content in this repository — including future updates to this file — must be written in **English**.

## Path Aliases

`@/*` maps to project root (configured in `tsconfig.json` and `babel.config.js`).

## Key External APIs

- Blockchain.info ticker: BTC/fiat price
- Mempool.space: Transaction explorer links
- Boltz exchange: Lightning swap API
- ASP server (default: `https://arkade.computer`): Ark Service Provider
