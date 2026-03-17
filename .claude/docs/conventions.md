# Code Conventions

> **Audience**: Developer, Reviewer

## TypeScript

- **Strict mode** abilitato
- **Target**: ESNext (Expo/Metro gestisce la transpilazione)
- **NO** estensioni `.js` negli import — questo è React Native con Metro bundler, non ESM Node
- **Path alias**: `@/*` mappa alla root del progetto (usa sempre `@/` invece di path relativi lunghi)
- Nessun `any`, nessun cast non sicuro

---

## Pattern Hook (React Query)

Ogni hook segue questo pattern:

```typescript
// hooks/<domain>/use-<feature>.ts

export function useBalance() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ['balance', wallet?.address],
    queryFn: async () => {
      if (!wallet) throw new Error('Wallet not initialized');
      return wallet.getBalance();
    },
    enabled: !!wallet,
    refetchInterval: 30_000,
  });
}
```

**Regole React Query:**
- Query keys: array con dominio + identificatore (`['balance', accountId]`, `['chat', chatId]`)
- `enabled: !!wallet` quando dipende dall'SDK inizializzato
- Mutation hooks invalidano le query correlate in `onSuccess`
- Loading e error state sempre gestiti nei componenti

### Mutation pattern

```typescript
export function useSendBitcoin() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationFn: async (params: SendParams) => {
      if (!wallet) throw new Error('Wallet not initialized');
      return wallet.sendBitcoin(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

---

## Pattern Componenti

```tsx
// components/<domain>/<ComponentName>.tsx

import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { P, Small } from '@/components/ui/typography';

type Props = {
  amount: number;
  onPress: () => void;
};

export function AmountButton({ amount, onPress }: Props) {
  return (
    <View className="flex-row items-center gap-2">
      <P className="text-primary">{amount}</P>
      <Button onPress={onPress}>
        <ButtonText>Confirm</ButtonText>
      </Button>
    </View>
  );
}
```

**Regole componenti:**
- Named export (no default export per i componenti)
- Props tipizzate con `type` (non `interface`)
- NativeWind per styling (`className` su tutti i componenti RN)
- Gluestack UI per componenti base (Button, Input, Card, Modal, ActionSheet)
- Tipografia semantica sempre (`H1`, `P`, `Large`, `Small`, `Muted`)

---

## Stile NativeWind

- Classi Tailwind su `className` direttamente
- Dark mode: `dark:bg-black dark:text-white`
- Non usare `StyleSheet.create()` — solo NativeWind
- Colori del tema via CSS variables (configurati in `tailwind.config.js`)

---

## Sistema Tipografico

```tsx
import { H1, P, Large, Small, Muted } from '@/components/ui/typography';

// Font bold: font-heading (UbuntuMono_700Bold)
// Font regular: font-body (UbuntuMono_400Regular)

<H1>48px Bold — titoli principali</H1>
<Large>20px Regular — sottotitoli</Large>
<P>16px Regular — testo corpo</P>
<Small>14px Regular — testo secondario</Small>
<Muted className="text-muted-foreground">14px Regular — testo muted</Muted>
```

Tutti i componenti accettano `className` per override NativeWind.

---

## Tipi Principali

```typescript
// Account
type ArkaicAccount = {
  name: string;
  privateKey: string;
  arkadeServerUrl: string;
  avatar?: string;
};

// Payment
type ArkaicPayment = {
  onchainAddress?: string;
  arkAddress?: string;
  lightningInvoice?: string;
  signerPubkey?: string;
  amount?: number;
};
```

---

## Naming Conventions

- **File**: kebab-case (`use-balance.ts`, `escrow-card.tsx`)
- **Componenti**: PascalCase (`EscrowCard`, `SendActionSheet`)
- **Hook**: camelCase con prefisso `use` (`useBalance`, `useCreateEscrow`)
- **Tipi**: PascalCase (`ArkaicAccount`, `EscrowStatus`)
- **Store**: acceduto via `useAccountStore()`, `useSettingsStore()`
- **Constants**: UPPER_SNAKE_CASE per valori costanti

---

## Platform-Specific Files

Per comportamenti diversi su web, crea varianti:

```
use-color-scheme.ts       # default (native)
use-color-scheme.web.ts   # web override
card/index.tsx            # default (native)
card/index.web.tsx        # web override
```

---

## Persistenza

- **AsyncStorage**: array accounts sotto `StorageKeys.ACCOUNTS`
- **expo-secure-store**: per dati sensibili (private keys, credentials)
- **Mai** mettere private keys o mnemonic in AsyncStorage

---

## Navigazione (expo-router)

```tsx
import { router } from 'expo-router';
import { Link } from 'expo-router';

// Navigazione programmatica
router.push('/listings/123');
router.back();

// Link dichiarativo
<Link href="/listings/create">Create</Link>
```

Route params tipizzate con `useLocalSearchParams<{ id: string }>()`.
