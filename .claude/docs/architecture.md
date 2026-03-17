# Architecture

> **Audience**: Planner, Reviewer

## Project Overview

Applicazione mobile Bitcoin wallet che implementa il protocollo Ark. Built con React Native + Expo SDK 54, TypeScript, e `@arkade-os/sdk` v0.3.0. Supporta iOS, Android e Web. Include un marketplace P2P (listings, chat, escrow) per scambi Bitcoin.

---

## Directory Structure

```
arkaic-wallet/
├── app/                      # Route expo-router (file-based)
│   ├── _layout.tsx           # Root layout (Gluestack, crypto polyfill)
│   ├── index.tsx             # Landing page
│   ├── account/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx     # Dashboard wallet principale
│   │   ├── buying.tsx        # Chat acquisti attivi
│   │   └── settings.tsx      # Impostazioni account
│   ├── listings/
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # Lista marketplace
│   │   ├── [id].tsx          # Dettaglio listing
│   │   ├── create.tsx        # Crea listing
│   │   └── my-listings.tsx   # I miei listings
│   └── chats/
│       ├── _layout.tsx
│       ├── index.tsx         # Lista chat
│       └── [id].tsx          # Chat singola con escrow
├── hooks/                    # React Query hooks per dominio
│   ├── wallet/               # balance, send, receive, onboard, vtxos, transactions
│   ├── account/              # create, login, logout, delete
│   ├── listings/             # CRUD listings marketplace
│   ├── escrows/              # pay, create, refund, sign, confirm
│   ├── chats/                # chat buyer/seller, start chat
│   ├── offers/               # offerte tra buyer e seller
│   ├── messages/             # invio messaggi
│   ├── use-bitcoin-price.ts  # Prezzo BTC (15min poll)
│   ├── use-asp-info.ts       # Info ASP server
│   ├── use-websocket.ts      # WebSocket real-time chat
│   └── use-clipboard.ts      # Copy/paste
├── stores/
│   ├── account.ts            # Zustand: SDK instances + account corrente
│   └── settings.tsx          # Zustand: valuta, display preferences
├── components/
│   ├── ui/                   # Gluestack UI + custom (typography, skeleton, ecc.)
│   ├── escrow/               # Componenti escrow (card, confirm sheet, status badge)
│   ├── chat/                 # Componenti chat (actions, send message, create offer)
│   ├── listing/              # Componenti listing (buy listing)
│   └── icons/                # Icone SVG (logo, sats)
├── utils/
│   ├── parse-bip21-address.ts
│   ├── shorten-address.ts
│   ├── mnemonic.ts
│   └── get-pubkey-hex.ts
└── constants/                # Colori e costanti
```

---

## State Management

### Zustand — `stores/account.ts`

Store globale che tiene le istanze dell'Ark SDK e l'account corrente:

```typescript
type AccountStore = {
  wallet: Wallet | null;
  arkProvider: ArkProvider | null;
  indexerProvider: IndexerProvider | null;
  vtxoManager: VtxoManager | null;
  arkadeLightning: ArkadeLightning | null;
  currentAccount: ArkaicAccount | null;
  // ...UI state
  setStore: (account: ArkaicAccount) => Promise<void>; // inizializza tutto l'SDK
}
```

**Flusso inizializzazione SDK:**
`ArkaicAccount` → `SingleKey.fromHex(privateKey)` → `Wallet.create()` → `BoltzSwapProvider` + `ArkadeLightning` + `VtxoManager`

### React Query — Data Fetching

Tutto il data fetching asincrono usa React Query hooks in `hooks/`:
- **Balance**: poll 30s
- **BTC Price**: poll 15min
- **Transactions**: on-demand + invalidation
- **Listings/Chats/Escrows**: on-demand + WebSocket updates

---

## Backend API

Il wallet si connette a un backend marketplace separato (non in questa repo) via `lib/api.ts`:

- **Base URL**: `http://localhost:4000/api`
- **Auth**: Bearer JWT token (da `stores/account.ts`) + firma Schnorr su body di POST/PUT/PATCH
- **Tipi**: modello dati condiviso in `types/backend.ts` (`Account`, `Listing`, `Chat`, `Escrow`, `Offer`, `Message`, `Review`)
- **Documentazione API**: mantenuta dal maintainer agent in `docs/` (quando presente)

Il flusso auth usa challenge-response Schnorr:
1. `POST /auth/register` — registra pubkey + username con firma
2. `POST /auth/challenge` — ottieni un nonce firmato dal server
3. `POST /auth/login` — firma il nonce, ricevi JWT Bearer token

---

## Ark SDK Integration

Tre pacchetti arkadeos:

| Pacchetto | Scopo |
|-----------|-------|
| `@arkade-os/sdk` | Core: `Wallet`, `SingleKey`, `VtxoManager`, `ArkProvider`, `IndexerProvider` |
| `@arkade-os/sdk/adapters/expo` | Expo-specific: `ExpoArkProvider`, `ExpoIndexerProvider` |
| `@arkade-os/boltz-swap` | Lightning: `ArkadeLightning`, `BoltzSwapProvider` |

**Regola chiave**: Le istanze SDK vivono nello store Zustand. I componenti e gli hook le leggono dallo store, **mai le inizializzano localmente**.

---

## Marketplace P2P

Il progetto include un sistema marketplace P2P su Ark:

### Flusso acquisto
1. **Listings** — venditore crea un listing con prezzo in BTC
2. **Offer** — compratore fa un'offerta nella chat
3. **Escrow** — venditore accetta, si crea un escrow Ark (pagamento custodito)
4. **Collaborazione** — `buyer confirm` + `seller sign` per completare la transazione
5. **Completamento** — fondi rilasciati automaticamente al venditore

### Escrow states
`pending` → `funded` → `completed` | `refunded`

---

## Payment Flow

- **Receiving**: BIP21 URI (`bitcoin:<onchain>?ark=<ark_addr>&amount=<btc>`) + Lightning invoice
- **Sending**: parse BIP21, distingui Ark vs on-chain tramite `signerPubkey`, invia via `wallet.sendBitcoin()`
- **Tipi di pagamento** (badge colorati): Ark (green), on-chain (orange), boarding (blue)

---

## UI Stack

| Layer | Tecnologia |
|-------|-----------|
| Componenti base | Gluestack UI (`components/ui/`) |
| Stile | NativeWind + TailwindCSS (classi su `className`) |
| Dark mode | Strategia `class`, CSS variable-based |
| QR Code | React Native Skia |
| Animazioni | Reanimated + Legend Motion |
| Font | Ubuntu Mono (heading bold, body regular) |
| Tipografia | `H1`, `P`, `Large`, `Small`, `Muted` da `components/ui/typography` |
