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
File-based routing via **expo-router** in `app/`. Routes: `index.tsx` (home/landing), `dashboard.tsx` (main screen), `create-profile.tsx`, `profile/create.tsx`, `profile/restore.tsx`. Root layout (`_layout.tsx`) wraps everything with Gluestack provider and crypto polyfill.

### State Management
- **Zustand** (`stores/profile.ts`): Global store holding Ark SDK instances (`Wallet`, `ArkProvider`, `IndexerProvider`, `VtxoManager`, `ArkadeLightning`), current account, and UI state. The `setAccount` action initializes the full Ark SDK stack from a profile's private key.
- **Zustand** (`stores/settings.tsx`): Currency symbol and transaction display preferences.
- **React Query** (`@tanstack/react-query`): Server state for balance (30s poll), BTC price (15min poll), transactions, ASP info.

### Ark SDK Integration
The wallet uses three arkadeos packages:
- `@arkade-os/sdk` — Core: `Wallet`, `SingleKey`, `VtxoManager`, `ArkProvider`, `IndexerProvider`
- `@arkade-os/sdk/adapters/expo` — Expo-specific: `ExpoArkProvider`, `ExpoIndexerProvider`
- `@arkade-os/boltz-swap` — Lightning: `ArkadeLightning`, `BoltzSwapProvider` (API: `https://api.ark.boltz.exchange`)

Wallet initialization flow: `ArkaicProfile` → `SingleKey.fromHex(privateKey)` → `Wallet.create()` → setup `BoltzSwapProvider` + `ArkadeLightning` + `VtxoManager` (10% threshold).

### Hooks (`hooks/`)
All data fetching uses React Query hooks. Key patterns:
- **Query hooks**: `useBalance`, `useBitcoinPrice`, `useTransactions`, `useArkTransactions`, `useAspInfo`, `useProfiles`, `useVtxos`, `useWallet`
- **Mutation hooks**: `useCreateProfile`, `useSendBitcoin`, `useOnboardUtxos`, `usePaymentAddress`, `useDeleteProfile`
- **Utility hooks**: `useCopyToClipboard`, `usePasteFromClipboard`, `useColorScheme`, `useThemeColor`

### Payment Flow
- **Receiving**: Generates BIP21 URI (`bitcoin:<onchain>?ark=<ark_addr>&amount=<btc>`) + Lightning invoice via `ArkadeLightning`
- **Sending**: Parses BIP21 address (`utils/parse-bip21-address.ts`), determines Ark vs on-chain based on `signerPubkey` match, sends via `wallet.sendBitcoin()`
- Three payment types distinguished by colored badges: Ark (green), on-chain (orange), boarding (blue)

### Persistence
- **AsyncStorage**: Profiles array stored under key `"profiles"` (see `StorageKeys` enum in `stores/profile.ts`)
- **expo-secure-store**: Available for sensitive data

### Types
- `ArkaicProfile`: `{ name, privateKey, arkadeServerUrl, avatar? }`
- `ArkaicPayment`: `{ onchainAddress?, arkAddress?, lightningInvoice?, signerPubkey?, amount? }`

### UI Stack
- **Gluestack UI** (`components/ui/`): Pre-built accessible components (Button, Input, Card, ActionSheet, Modal, etc.)
- **Nativewind + TailwindCSS**: Utility-first styling with dark mode (`class` strategy), CSS variable-based theme colors
- **React Native Skia**: QR code rendering
- **Reanimated + Legend Motion**: Animations and carousel

### Forms
- **Formik** for `create-profile-form.tsx` (profile creation)
- **React Hook Form + Zod** available for other forms
- **ts-pattern** for pattern matching in conditional logic

## Commit Convention

Commits follow the **Conventional Commits** standard, compatible with `generate-changelog`. Format:

```
<type>: <description>
<type>(<category>): <description>
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`.

Examples:
```
feat: add QR code scanner for payments
feat(wallet): add QR code scanner for payments
fix: correct balance rounding in sats display
refactor: extract payment parsing to utility
```

**Important**: Never add "Co-Authored-By: Claude" or any AI attribution to commit messages.

## Language

All code, comments, and content in this repository — including future updates to this file — must be written in **English**.

## Path Aliases
`@/*` maps to project root (configured in `tsconfig.json` and `babel.config.js`).

## Key External APIs
- Blockchain.info ticker: BTC/fiat price
- Mempool.space: Transaction explorer links
- Boltz exchange: Lightning swap API
- ASP server (default: `https://arkade.computer`): Ark Service Provider
