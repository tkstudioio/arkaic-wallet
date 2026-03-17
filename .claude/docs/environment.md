# Environment & Infrastructure

> **Audience**: All agents

## Package Manager

**CRITICAL: Always use `yarn` (never `npm`).**

Node version: see `.nvmrc` (lts/jod). Run `nvm use` before starting.

---

## Commands

```bash
yarn install          # Install dependencies
yarn start            # Start Expo dev server
yarn android          # Start on Android emulator/device
yarn ios              # Start on iOS simulator/device
yarn web              # Start on web browser
yarn lint             # ESLint
yarn reset-project    # Reset project state
```

---

## Technology Stack

- **Expo** SDK 54
- **React Native** (iOS, Android, Web)
- **TypeScript** (strict mode)
- **Yarn** (package manager)

### Dipendenze chiave

| Area | Dipendenze |
|------|-----------|
| Routing | expo-router |
| State | zustand |
| Data fetching | @tanstack/react-query |
| Ark SDK | @arkade-os/sdk, @arkade-os/boltz-swap |
| UI | @gluestack-ui, nativewind, tailwindcss |
| QR Code | @shopify/react-native-skia |
| Animazioni | react-native-reanimated, @legendapp/motion |
| Font | @expo-google-fonts/ubuntu-mono |
| Forms | formik, react-hook-form, zod |
| Storage | @react-native-async-storage/async-storage, expo-secure-store |

---

## Git Hooks

Nessun hook attivo. Non c'è Husky o lint-staged configurato.

---

## Commit Convention

Seguire il formato **Conventional Commits** compatibile con `generate-changelog`:

```
type(scope): description
```

### Valid Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting changes |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD configuration |
| `revert` | Reverts a previous commit |

### Scope suggeriti

`wallet`, `escrow`, `listings`, `chat`, `account`, `ui`, `store`, `hooks`, `deps`

### Examples

```
feat(escrow): add dispute resolution flow
fix(wallet): correct balance display for boarding vtxos
refactor(chat): extract message bubbles to separate component
chore(deps): bump @arkade-os/sdk to 0.3.1
feat(listings): add search and filter functionality
```

---

## Versioning

```bash
yarn release:major    # 0.1.0 → 1.0.0
yarn release:minor    # 0.1.0 → 0.2.0
yarn release:patch    # 0.1.0 → 0.1.1
yarn changelog        # Genera solo il changelog
```

Il sistema usa `generate-changelog` per creare `CHANGELOG.md` automaticamente dai commit.

---

## Agent Pipeline

| Agent | When to invoke |
|-------|---------------|
| **planner** | Before any feature/fix — produces task file for developer |
| **developer** | After planner creates task file |
| **reviewer** | After developer finishes implementation |
| **versioner** | After reviewer approves — creates atomic commits |
| **maintainer** | Standalone — when backend API endpoints or flows change, to update `docs/` and `README.md` |

---

## External APIs

| API | Scopo |
|-----|-------|
| `https://arkade.computer` | ASP (Ark Service Provider) default |
| `https://api.ark.boltz.exchange` | Boltz Lightning swap |
| Blockchain.info ticker | BTC/fiat price |
| Mempool.space | Transaction explorer links |
