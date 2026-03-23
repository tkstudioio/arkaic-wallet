---
description: Create, read, and modify Zustand stores following project patterns
---

# zustand

Manage global client-side state using Zustand. All stores live in `stores/` and follow a consistent structure derived from `stores/account.ts` and `stores/settings.tsx`.

---

## File Location & Naming

| What | Convention | Example |
|------|-----------|---------|
| Directory | `stores/` at project root | `stores/` |
| File | `stores/<domain>.ts` | `stores/market.ts` |
| Use `.tsx` | only if JSX is needed | `stores/settings.tsx` |
| Store hook | `use<Domain>Store` | `useMarketStore` |
| Export | default export | `export default useMarketStore` |

---

## Store Anatomy

Every store follows this three-part structure:

```typescript
// 1. Type — state fields + action signatures
type MarketStore = {
  // state fields (optional = undefined by default)
  selectedCategoryId?: number;
  // required fields always have a default value
  isFiltersVisible: boolean;
  // actions
  setSelectedCategoryId: (id: number | undefined) => void;
  toggleFilters: () => void;
};

// 2. Create — generic non-curried form
const useMarketStore = create<MarketStore>((set) => ({
  // required defaults
  isFiltersVisible: false,
  // actions
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  toggleFilters: () =>
    set(({ isFiltersVisible }) => ({ isFiltersVisible: !isFiltersVisible })),
}));

// 3. Export
export default useMarketStore;
```

> **Note**: Use `create<T>((set) => ({...}))` — the non-curried single-call form. Do NOT use `create<T>()((set) => ({...}))`.

---

## Three Action Patterns

### 1. Simple Setter

Direct assignment — no need to spread existing state (Zustand merges shallowly).

```typescript
type SettingsStore = {
  symbol: CurrencySymbol;
  setSymbol: (symbol: CurrencySymbol) => void;
};

// in create():
setSymbol: (symbol) => set({ symbol }),
```

### 2. Toggle (Functional Updater)

Use functional form when the new value depends on the current state.

```typescript
type SettingsStore = {
  detailedTransactions: boolean;
  toggleDetailedTransactions: () => void;
};

// in create():
toggleDetailedTransactions: () =>
  set(({ detailedTransactions }) => ({
    detailedTransactions: !detailedTransactions,
  })),
```

### 3. Bulk Setter (`setStore`)

Used when multiple fields must be updated at once (e.g., after login / SDK init). Type it with `Partial<Omit<Store, actions>>` to exclude actions from the allowed keys.

```typescript
type AccountStore = {
  wallet?: Wallet;
  token?: string;
  // ... other state fields ...
  setStore: (
    values: Partial<Omit<AccountStore, "setStore" | "logout">>,
  ) => void;
};

// in create():
setStore: (values) => set(values),
```

### 4. Reset Pattern

Explicitly set each field to `undefined`. Do **not** use `replace: true`.

```typescript
type AccountStore = {
  wallet?: Wallet;
  token?: string;
  logout: () => void;
};

// in create():
logout: () =>
  set({
    wallet: undefined,
    token: undefined,
    // list every field that must be cleared
  }),
```

---

## Consuming Stores

### In Hooks

```typescript
import useAccountStore from "@/stores/account";
import useSettingsStore from "@/stores/settings";

export function useBalance() {
  const { wallet } = useAccountStore();
  const { symbol } = useSettingsStore();

  return useQuery({
    queryKey: ["balance", wallet?.arkAddress, symbol],
    queryFn: () => {
      if (!wallet) throw new Error("Wallet not initialized");
      return wallet.getBalance();
    },
    enabled: !!wallet, // guard: enable only when wallet is ready
  });
}
```

### In Components

```typescript
import useAccountStore from "@/stores/account";

export default function AccountPage() {
  const { account, fingerprint } = useAccountStore();

  if (!account) return null;

  return <Large>{account.name}</Large>;
}
```

### Import Rule

Always use the `@/` alias — never relative paths:

```typescript
// ✅ Good
import useAccountStore from "@/stores/account";

// ❌ Avoid
import useAccountStore from "../../stores/account";
```

---

## TypeScript Rules

- Use `type`, never `interface`
- No `any` — always type state fields and action parameters
- Explicit generic on `create<T>`: `create<MyStore>((set) => ({...}))`
- Optional fields use `?` and default to `undefined` (no need to include them in the initial state object)

```typescript
// ✅ Good
type MarketStore = {
  categoryId?: number;
  setCategory: (id: number) => void;
};

// ❌ Avoid
interface MarketStore {
  categoryId: any;
}
```

---

## When to Create a New Store vs Extend Existing

| Situation | Action |
|-----------|--------|
| New domain with independent lifecycle (e.g., marketplace filters) | Create `stores/<domain>.ts` |
| Adding wallet/session/auth-related state | Extend `stores/account.ts` |
| Adding app-wide UI preferences | Extend `stores/settings.tsx` |

---

## Existing Stores

| File | Purpose | Key Fields |
|------|---------|-----------|
| `stores/account.ts` | Auth session & Ark SDK state | `wallet`, `token`, `pubkey`, `account`, `arkProvider`, `vtxoManager` |
| `stores/settings.tsx` | App-wide UI preferences | `symbol`, `detailedTransactions` |

---

## Verification Checklist

Before committing a new or modified store:

- [ ] File is in `stores/` with a kebab-case filename
- [ ] Store hook is named `use<Domain>Store` and is the default export
- [ ] Type uses `type`, not `interface`
- [ ] `create<T>` has an explicit generic
- [ ] Required fields have default values in the initial state object
- [ ] Optional fields are typed with `?` (no need to initialize to `undefined`)
- [ ] Functional updater used when new value depends on previous state
- [ ] `setStore` typed with `Partial<Omit<Store, actions>>` if present
- [ ] Reset action lists every field explicitly (no `replace: true`)
- [ ] All imports use `@/` alias
