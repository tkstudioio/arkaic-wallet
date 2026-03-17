# SDK & Packages Reference

> **Audience**: Developer, Planner, Reviewer, Maintainer

## @arkade-os/sdk

Core SDK per il protocollo Ark.

### Classi principali

| Classe | Scopo |
|--------|-------|
| `Wallet` | Operazioni wallet (balance, send, receive, onboard) |
| `SingleKey` | Chiave privata single-key (`SingleKey.fromHex(privateKey)`) |
| `VtxoManager` | Gestione VTXO (10% threshold per auto-onboard) |
| `ArkProvider` | Provider Ark (usa `ExpoArkProvider` in Expo) |
| `IndexerProvider` | Provider indexer (usa `ExpoIndexerProvider` in Expo) |

### Adapter Expo

```typescript
import { ExpoArkProvider, ExpoIndexerProvider } from '@arkade-os/sdk/adapters/expo';
```

### Inizializzazione (da `stores/account.ts`)

```typescript
const signer = await SingleKey.fromHex(account.privateKey);
const wallet = await Wallet.create({
  signer,
  arkProvider: new ExpoArkProvider(account.arkadeServerUrl),
  indexerProvider: new ExpoIndexerProvider(),
});
```

---

## @arkade-os/boltz-swap

Lightning swap tramite Boltz exchange.

### Classi principali

| Classe | Scopo |
|--------|-------|
| `ArkadeLightning` | Gestione pagamenti Lightning via swap |
| `BoltzSwapProvider` | Provider swap (`https://api.ark.boltz.exchange`) |

### Uso

```typescript
const boltzProvider = new BoltzSwapProvider({ apiUrl: 'https://api.ark.boltz.exchange' });
const lightning = new ArkadeLightning({ wallet, swapProvider: boltzProvider });

// Crea invoice
const invoice = await lightning.createInvoice({ amount: 10000 });

// Paga invoice
await lightning.payInvoice({ invoice: 'lnbc...' });
```

---

## Gluestack UI

Componenti accessibili pre-built da `@/components/ui/`.

### Componenti disponibili

| Componente | Import |
|-----------|--------|
| Button | `@/components/ui/button` |
| Input | `@/components/ui/input` |
| Card | `@/components/ui/card` |
| ActionSheet | `@/components/ui/actionsheet` |
| Modal | `@/components/ui/modal` |
| AlertDialog | `@/components/ui/alert-dialog` |
| Avatar | `@/components/ui/avatar` |
| Badge | `@/components/ui/badge` |
| Spinner | `@/components/ui/spinner` |
| Skeleton | `@/components/ui/skeleton` |
| Select | `@/components/ui/select` |
| Switch | `@/components/ui/switch` |
| FormControl | `@/components/ui/form-control` |
| Divider | `@/components/ui/divider` |
| HStack / VStack | `@/components/ui/hstack`, `@/components/ui/vstack` |
| Grid | `@/components/ui/grid` |
| Table | `@/components/ui/table` |
| Menu | `@/components/ui/menu` |
| Drawer | `@/components/ui/drawer` |

### Tipografia semantica (`@/components/ui/typography`)

```typescript
import { H1, P, Large, Small, Muted } from '@/components/ui/typography';
```

| Componente | px | Weight | Font |
|-----------|-----|--------|------|
| `H1` | 48 | Bold | UbuntuMono_700Bold |
| `Large` | 20 | Regular | UbuntuMono_400Regular |
| `P` | 16 | Regular | UbuntuMono_400Regular |
| `Small` | 14 | Regular | UbuntuMono_400Regular |
| `Muted` | 14 | Regular | UbuntuMono_400Regular |

---

## React Query (`@tanstack/react-query`)

Client configurato in `app/_layout.tsx`.

### Query keys per dominio

| Dominio | Key pattern |
|---------|-------------|
| Balance | `['balance', accountId]` |
| Transactions | `['transactions', accountId]` |
| VTXOs | `['vtxos', accountId]` |
| BTC Price | `['btc-price']` |
| ASP Info | `['asp-info', serverUrl]` |
| Listing | `['listing', listingId]` |
| Listings | `['listings']` |
| My Listings | `['my-listings', pubkey]` |
| Chat | `['chat', chatId]` |
| Chats | `['chats', pubkey]` |
| Escrow | `['escrow', escrowId]` |
| Offer | `['offer', offerId]` |

---

## Zustand

### useAccountStore

```typescript
import { useAccountStore } from '@/stores/account';

const { wallet, arkadeLightning, vtxoManager, currentAccount, setStore } = useAccountStore();
```

### useSettingsStore

```typescript
import { useSettingsStore } from '@/stores/settings';

const { currencySymbol, showSats } = useSettingsStore();
```

---

## expo-router

### Struttura route

```
app/
├── _layout.tsx           # Root
├── index.tsx             # /
├── account/
│   ├── _layout.tsx       # Tab layout
│   ├── dashboard.tsx     # /account/dashboard
│   ├── buying.tsx        # /account/buying
│   └── settings.tsx      # /account/settings
├── listings/
│   ├── index.tsx         # /listings
│   ├── [id].tsx          # /listings/:id
│   ├── create.tsx        # /listings/create
│   └── my-listings.tsx   # /listings/my-listings
└── chats/
    ├── index.tsx         # /chats
    └── [id].tsx          # /chats/:id
```

### Navigazione

```typescript
import { router, useLocalSearchParams } from 'expo-router';

// Params tipizzati
const { id } = useLocalSearchParams<{ id: string }>();

// Navigazione
router.push('/listings/create');
router.replace('/account/dashboard');
router.back();
```

---

## Backend API Client (`lib/api.ts`)

Client Axios che comunica con il backend marketplace (servizio separato, non in questa repo).

### Configurazione

```typescript
import { backend } from '@/lib/api';

export const API_BASE_URL = 'http://localhost:4000/api';
```

### Autenticazione

Ogni richiesta autenticata include automaticamente (via interceptor):

1. **Bearer token** nell'header `Authorization: Bearer <token>`
2. **Firma Schnorr** per POST/PUT/PATCH: il body viene ordinato per chiave, serializzato in JSON, firmato con la private key dell'account, e il campo `signature` viene aggiunto al body

Le route `/auth/*` sono escluse dall'auth automatica.

### Tipi disponibili (`types/backend.ts`)

| Tipo | Descrizione |
|------|-------------|
| `Account` | Profilo utente (pubkey, username, isArbiter) |
| `Challenge` | Nonce per autenticazione Schnorr |
| `Listing` | Annuncio marketplace (nome, prezzo, seller) |
| `Chat` | Conversazione buyer-seller su un listing |
| `Message` | Messaggio in una chat (testo o offer) |
| `Offer` | Proposta di prezzo inviata in chat |
| `OfferAcceptance` | Risposta accettazione/rifiuto offerta |
| `Escrow` | Pagamento custodito Ark (con state machine) |
| `Review` | Recensione post-transazione |
| `Category` | Categoria per i listing |
| `EscrowStatus` | `awaitingFunds` → `fundLocked` → `completed` / `refunded` |
| `ChatStatus` | `open` / `closed` |

> La documentazione completa degli endpoint è in `docs/` (mantenuta dal maintainer agent).
