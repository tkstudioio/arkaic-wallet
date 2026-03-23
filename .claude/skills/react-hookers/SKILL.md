---
description: Write React hooks following project patterns and conventions
---

# react-hookers

Write React hooks that follow the project's established patterns using React Query, Zustand, and TypeScript.

## Hook Structure

All hooks are located in the `hooks/` directory, organized by feature domain:

```
hooks/
├── wallet/
│   ├── use-balance.ts
│   ├── use-send-bitcoin.ts
│   └── ...
├── listings/
│   ├── use-listing.ts
│   ├── use-create-listing.ts
│   └── ...
├── chats/
├── escrows/
├── categories/
├── use-bitcoin-price.ts       # shared hooks (no subdirectory)
├── use-clipboard.ts
├── use-websocket.ts
└── ...
```

## File Organization

**File naming**: kebab-case with `use-` prefix
```
hooks/<domain>/use-<feature>.ts
```

**Hook naming**: camelCase with `use` prefix
```typescript
export function useBalance() { }
export function useCreateListing() { }
export function useCopyToClipboard() { }
```

## Three Core Patterns

### 1. Query Pattern (Data Fetching)

Use this for **reading data** from the API.

```typescript
// hooks/listings/use-listing.ts

import { backend } from "@/lib/api";
import { Listing } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useListing(id: number | string) {
  return useQuery({
    queryKey: ["listing", id],           // array: [domain, identifier]
    queryFn: async (): Promise<Listing> => {
      const { data } = await backend.get(`/listings/${id}`);
      return data;
    },
    enabled: !!id,                        // enable only when id is present
    refetchInterval: 15 * 60 * 1000,      // refetch every 15 minutes
    throwOnError: true,                   // let React Query handle errors
  });
}
```

**Guidelines:**
- Query key: always an array `[domain, ...identifiers]`
- Use `enabled` when hook depends on wallet initialization or user state
- Let React Query handle loading/error states (don't wrap in try-catch)
- Use `refetchInterval` for data that changes frequently
- Return the query object directly — don't unwrap in the hook
- Import types from `@/types/backend`

### 2. Mutation Pattern (Data Modification)

Use this for **writing/updating data** (create, update, delete).

```typescript
// hooks/listings/use-create-listing.ts

import { backend } from "@/lib/api";
import { CreateListingAttribute, Listing } from "@/types/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

type CreateListingParams = {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  attributes: CreateListingAttribute[];
};

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-listing"],      // optional but recommended
    mutationFn: async (params: CreateListingParams): Promise<Listing> => {
      const { data } = await backend.post("/listings", params);
      return data;
    },
    onError: (err: Error) => {
      // Log errors for debugging
      if (isAxiosError(err)) {
        console.error(err.response?.data);
      }
    },
    onSuccess: () => {
      // Invalidate affected queries so they refetch
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
```

**Guidelines:**
- Always type mutation parameters with a `type` (not `interface`)
- Return type from `mutationFn` should be explicit
- Use `onSuccess` to invalidate related queries
- Use `onError` to log errors (don't use try-catch)
- Call `queryClient.invalidateQueries()` for all affected queries
- Import `useQueryClient` from `@tanstack/react-query`

### 3. Effect Pattern (Side Effects)

Use this for **listeners, WebSocket, subscriptions**, and imperative side effects.

```typescript
// hooks/use-websocket.ts

import useAccountStore from "@/stores/account";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const WS_URL = "ws://localhost:4000/ws";

type WsMessage = {
  type: "new_message" | "offer_accepted" | "escrow_update";
  chatId?: number;
  address?: string;
};

export function useWebSocket() {
  const token = useAccountStore((s) => s.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    const handleMessage = (event: MessageEvent) => {
      try {
        const message: WsMessage = JSON.parse(event.data);

        if (message.type === "new_message") {
          queryClient.refetchQueries({ queryKey: ["chats"] });
        }
      } catch {
        console.error("Failed to parse message", event.data);
      }
    };

    ws.addEventListener("message", handleMessage);

    // Cleanup: always remove listener and close connection
    return () => {
      ws.removeEventListener("message", handleMessage);
      ws.close();
    };
  }, [token, queryClient]);
}
```

**Guidelines:**
- Use `useEffect` for setup/teardown logic
- Always include a **cleanup function** in the return
- Include dependencies array `[token, queryClient, ...]`
- Don't return a query object — side effects return `void`
- Use `useQueryClient()` to refetch queries on external events

---

## Common Patterns

### Accessing Global State

```typescript
import useAccountStore from "@/stores/account";
import useSettingsStore from "@/stores/settings";

export function useBalance() {
  const { wallet } = useAccountStore();
  const { symbol } = useSettingsStore();

  return useQuery({
    queryKey: ["balance", wallet?.arkAddress, symbol],
    queryFn: async () => {
      if (!wallet) throw new Error("Wallet not initialized");
      return wallet.getBalance();
    },
    enabled: !!wallet,
  });
}
```

### Multiple Exports in One File

```typescript
// hooks/use-clipboard.ts

export function useCopyToClipboard() {
  return useMutation({
    mutationFn: (data: string) => Clipboard.setStringAsync(data),
  });
}

export function usePasteFromClipboard() {
  return useMutation({
    mutationFn: () => Clipboard.getStringAsync(),
  });
}
```

### Type Exports

```typescript
// hooks/use-bitcoin-price.ts

export type CurrencySymbol = "USD" | "EUR" | "GBP" | ...;

export type ExchangeRate = {
  symbol: CurrencySymbol;
  last: number;
  buy: number;
  sell: number;
};

export default function useBitcoinPrice(symbol: CurrencySymbol) {
  // ...
}
```

---

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| File | kebab-case | `use-balance.ts` |
| Hook function | camelCase + `use` prefix | `useBalance()` |
| Type | PascalCase | `ExchangeRate`, `CreateListingParams` |
| Query key | array, kebab-case domain | `["balance", id]`, `["chat-offer", chatId]` |
| Mutation key | array, kebab-case | `["create-listing"]`, `["delete-chat"]` |

---

## Imports & Aliases

Always use the `@/` path alias. Never use relative paths:

```typescript
// ✅ Good
import { backend } from "@/lib/api";
import { Listing } from "@/types/backend";
import useAccountStore from "@/stores/account";

// ❌ Avoid
import { backend } from "../../../lib/api";
import { Listing } from "../types/backend";
```

---

## TypeScript & Type Safety

- **No `any`** — always type parameters and return values
- **Use `type` not `interface`** for parameter types
- **Explicit return types** on query/mutation functions
- **Discriminated unions** for complex types

```typescript
// ✅ Good
type CreateParams = { name: string; price: number };
export function useCreate() {
  return useMutation({
    mutationFn: async (params: CreateParams): Promise<Listing> => { },
  });
}

// ❌ Avoid
export function useCreate() {
  return useMutation({
    mutationFn: async (params: any) => { },
  });
}
```

---

## Error Handling

- **Let React Query handle errors** — don't wrap in try-catch
- **Throw errors** when preconditions fail (missing wallet, missing ID)
- **Log errors in `onError`** for mutations

```typescript
// ✅ Good: let React Query handle the error
return useQuery({
  queryFn: async () => {
    if (!wallet) throw new Error("Wallet not initialized");
    return wallet.getBalance();
  },
});

// ✅ Good: log in mutation onError
return useMutation({
  mutationFn: async (params) => backend.post("/api", params),
  onError: (err) => console.error("Failed:", err),
});

// ❌ Avoid: try-catch inside queryFn
queryFn: async () => {
  try {
    return wallet.getBalance();
  } catch (e) {
    return null; // hiding the error
  }
}
```

---

## Verification Checklist

Before committing a new hook, verify:

- [ ] File location: `hooks/<domain>/use-<feature>.ts`
- [ ] Hook name: camelCase with `use` prefix
- [ ] Exports: `export function useXyz() {}` (named exports)
- [ ] Query/Mutation key: array with domain and identifiers
- [ ] Dependencies: `enabled`, `refetchInterval`, or dependencies array filled
- [ ] Types: no `any`, use `type` not `interface`
- [ ] Imports: all use `@/` alias, no relative paths
- [ ] Error handling: no try-catch in queryFn, use `onError` in mutations
- [ ] Cleanup: useEffect hooks have cleanup function
- [ ] Store access: uses `useAccountStore()` or `useSettingsStore()` correctly

---

## Real Examples in the Codebase

| File | Pattern | Purpose |
|------|---------|---------|
| `hooks/wallet/use-balance.ts` | Query | Fetch wallet balance with refetch |
| `hooks/listings/use-listings.ts` | Query | Fetch all listings |
| `hooks/listings/use-create-listing.ts` | Mutation | Create new listing + invalidate |
| `hooks/use-clipboard.ts` | Mutation (×2) | Copy/paste with named exports |
| `hooks/use-websocket.ts` | Effect | WebSocket listener with cleanup |
| `hooks/use-bitcoin-price.ts` | Query + Type export | BTC price + currency type |
