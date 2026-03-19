# Task: Extend attribute types to support range, text, date, and multi_select

## Contesto

Il backend ha esteso il sistema di attributi dei listing. Fino ad ora il campo `type` degli attributi supportava solo `"select"` e `"boolean"`. Ora sono stati aggiunti quattro nuovi tipi: `"text"`, `"range"`, `"date"` e `"multi_select"`. Questo impatta i tipi TypeScript, i componenti di form e display degli attributi, la logica di creazione/modifica listing, e il sistema di filtri nella pagina categoria.

## Obiettivo

Aggiornare il frontend per supportare tutti e sei i tipi di attributo (`select`, `boolean`, `text`, `range`, `date`, `multi_select`) in:
1. Tipi TypeScript (`types/backend.ts`)
2. Display degli attributi nella pagina dettaglio listing
3. Form di creazione listing (campo attributi)
4. Filtri nella pagina categoria
5. Hook di creazione listing (payload corretto)

## File coinvolti

### Da modificare
| File | Motivo |
|------|--------|
| `types/backend.ts` | Estendere `CategoryAttribute`, `ListingAttributeValue`, e aggiungere tipo per i filtri |
| `components/listing/attribute-display.tsx` | Rendere i nuovi tipi (text, range con unit, date, multi_select) |
| `components/listing/attribute-form-field.tsx` | Aggiungere campi form per text, range, date, multi_select |
| `app/listings/create.tsx` | Aggiornare logica onSubmit per costruire il payload corretto per i nuovi tipi |
| `hooks/listings/use-create-listing.ts` | Aggiornare il tipo `CreateProductParams` per supportare il nuovo shape degli attributi |
| `app/categories/[slug].tsx` | Aggiornare `AttributeField` e `AttributeChip` per i nuovi tipi di filtro (range, date, multi_select) |

### Da leggere (riferimento)
| File | Motivo |
|------|--------|
| `hooks/categories/use-category-attributes.ts` | Capire come vengono fetchati gli attributi (endpoint `/attributes/by-category/:id`) |
| `hooks/listings/use-listing.ts` | Capire la shape della response listing |
| `app/listings/[id].tsx` | Capire come `AttributeDisplay` viene usato |

## Implementazione dettagliata

### Step 1 - Aggiornare i tipi in `types/backend.ts`

#### 1a. Estendere `AttributeType`

Creare un type alias per i tipi di attributo e usarlo ovunque:

```typescript
export type AttributeType = "select" | "boolean" | "text" | "range" | "date" | "multi_select";
```

#### 1b. Estendere `CategoryAttribute`

Il tipo attuale e':

```typescript
export type CategoryAttribute = {
  attributeId: number;
  name: string;
  slug: string;
  type: "select" | "boolean";
  required: boolean;
  isFilterable: boolean;
  values: { id: number; value: string }[];
};
```

Deve diventare:

```typescript
export type CategoryAttribute = {
  attributeId: number;
  name: string;
  slug: string;
  type: AttributeType;
  required: boolean;
  isFilterable: boolean;
  values: { id: number; value: string }[];
  // Range-specific fields (only present when type === "range")
  rangeMin?: number;
  rangeMax?: number;
  rangeStep?: number;
  rangeUnit?: string;
};
```

I campi `rangeMin`, `rangeMax`, `rangeStep`, `rangeUnit` sono opzionali e presenti solo quando `type === "range"`. Il campo `values` rimane un array (sara' vuoto per `range`, `date`, `text`; popolato per `select` e `multi_select`).

#### 1c. Estendere `ListingAttributeValue`

Il tipo attuale e':

```typescript
export type ListingAttributeValue = {
  id: number;
  listingId: number;
  attributeId: number;
  valueId: number | null;
  valueBool: boolean | null;
  attribute: {
    id: number;
    name: string;
    slug: string;
    type: "select" | "boolean";
  };
  value: {
    id: number;
    attributeId: number;
    value: string;
  } | null;
};
```

Deve diventare:

```typescript
export type ListingAttributeValue = {
  id: number;
  listingId: number;
  attributeId: number;
  valueId: number | null;
  valueBool: boolean | null;
  valueText: string | null;
  valueFloat: number | null;
  attribute: {
    id: number;
    name: string;
    slug: string;
    type: AttributeType;
  };
  value: {
    id: number;
    attributeId: number;
    value: string;
  } | null;
  multiValues: { id: number; value: string }[] | null;
};
```

Nuovi campi:
- `valueText` -- stringa per `text`, `range`, `date`
- `valueFloat` -- float per `range` (il backend lo calcola da `valueText`)
- `multiValues` -- array di `{ id, value }` per `multi_select`

#### 1d. Creare tipo per il payload di creazione attributo

Aggiungere un tipo dedicato per il body di POST/PATCH listing (diverso dalla response):

```typescript
export type CreateListingAttribute =
  | { attributeId: number; valueId: number }
  | { attributeId: number; valueBool: boolean }
  | { attributeId: number; valueText: string }
  | { attributeId: number; valueIds: number[] };
```

Questo tipo discriminated union chiarisce quale campo usare per ogni tipo di attributo:
- `select` -> `valueId` (l'ID del valore selezionato)
- `boolean` -> `valueBool`
- `text` -> `valueText` (stringa libera)
- `range` -> `valueText` (stringa numerica, es. `"42000"`)
- `date` -> `valueText` (formato `"YYYY-MM-DD"`)
- `multi_select` -> `valueIds` (array di ID)

#### 1e. Creare tipo per i filtri della categoria

Aggiungere un tipo per la response di `GET /api/attributes/filters/:categoryId`:

```typescript
export type CategoryFilterAttribute = {
  attributeId: number;
  name: string;
  slug: string;
  type: AttributeType;
  isFilterable: boolean;
  // Present for select and multi_select
  values?: { id: number; value: string }[];
  // Present for range
  rangeMin?: number;
  rangeMax?: number;
  rangeStep?: number;
  rangeUnit?: string;
};
```

---

### Step 2 - Aggiornare `components/listing/attribute-display.tsx`

Il componente attualmente gestisce solo `boolean` e `select`. Deve gestire tutti e 6 i tipi usando `match` da `ts-pattern`.

Logica di display per tipo:
- `select` -> mostra `value.value` (come gia' fa)
- `boolean` -> mostra `"Yes"` / `"No"` (come gia' fa)
- `text` -> mostra `valueText`
- `range` -> mostra `valueText` (o `valueFloat`) con l'unita' se presente nell'attributo (es. `"42,000 km"`). NOTA: l'unita' (`rangeUnit`) non e' disponibile direttamente nella `ListingAttributeValue` -- e' nell'attributo della categoria. Per la visualizzazione nel dettaglio listing, mostrare solo `valueText` formattato come numero. Se si vuole mostrare l'unita', servira' un lookup aggiuntivo -- per ora mostrare solo il valore numerico formattato.
- `date` -> mostra `valueText` formattata come data leggibile (es. `new Date(valueText).toLocaleDateString()`)
- `multi_select` -> mostra i valori di `multiValues` separati da virgola (es. `"Cruise Control, ABS, GPS"`)

Sostituire l'attuale logica `if/else` con `match(attribute.type)`:

```tsx
const displayValue = match(attribute.type)
  .with("boolean", () => (valueBool ? "Yes" : "No"))
  .with("select", () => value?.value ?? "-")
  .with("text", () => valueText ?? "-")
  .with("range", () => {
    if (valueFloat !== null && valueFloat !== undefined) {
      return valueFloat.toLocaleString();
    }
    return valueText ?? "-";
  })
  .with("date", () => {
    if (!valueText) return "-";
    return new Date(valueText).toLocaleDateString();
  })
  .with("multi_select", () => {
    if (!multiValues || multiValues.length === 0) return "-";
    return multiValues.map((v) => v.value).join(", ");
  })
  .otherwise(() => "-");
```

---

### Step 3 - Aggiornare `components/listing/attribute-form-field.tsx`

Il componente attualmente gestisce solo `select` e `boolean`. Deve gestire tutti e 6 i tipi.

#### Props type

Il tipo delle props deve essere aggiornato per accogliere i nuovi valori:

```typescript
type AttributeFormFieldProps = {
  attr: CategoryAttribute;
  value: string | boolean | number[] | undefined;
  onChange: (value: string | boolean | number[]) => void;
};
```

#### Nuovi campi da aggiungere nel `match(attr.type)`

**`text`**: Un campo `Input`/`InputField` per testo libero.

```tsx
.with("text", () => (
  <Input>
    <InputField
      placeholder="Enter value..."
      value={typeof value === "string" ? value : ""}
      onChangeText={(v) => onChange(v)}
    />
  </Input>
))
```

**`range`**: Un campo `Input`/`InputField` con `keyboardType="numeric"`. Mostrare l'unita' (`attr.rangeUnit`) come label accanto all'input e un hint con min/max.

```tsx
.with("range", () => (
  <VStack space="xs">
    <HStack space="sm" className="items-center">
      <Input className="flex-1">
        <InputField
          placeholder={`${attr.rangeMin ?? 0} - ${attr.rangeMax ?? ""}`}
          value={typeof value === "string" ? value : ""}
          onChangeText={(v) => onChange(v)}
          keyboardType="numeric"
        />
      </Input>
      {attr.rangeUnit ? <Small className="text-arkaic-muted">{attr.rangeUnit}</Small> : null}
    </HStack>
    {attr.rangeMin !== undefined && attr.rangeMax !== undefined ? (
      <Small className="text-arkaic-muted">
        Min: {attr.rangeMin.toLocaleString()} - Max: {attr.rangeMax.toLocaleString()}
      </Small>
    ) : null}
  </VStack>
))
```

**`date`**: Un campo `Input`/`InputField` con placeholder `"YYYY-MM-DD"`. Non esiste un DatePicker nel progetto -- usare un semplice text input per ora.

```tsx
.with("date", () => (
  <Input>
    <InputField
      placeholder="YYYY-MM-DD"
      value={typeof value === "string" ? value : ""}
      onChangeText={(v) => onChange(v)}
    />
  </Input>
))
```

**`multi_select`**: Non esiste un componente Checkbox nel progetto. Implementare una lista di `Button` che funzionano come toggle (pressione aggiunge/rimuove l'ID dall'array). Il valore e' un `number[]`.

```tsx
.with("multi_select", () => {
  const selectedIds = Array.isArray(value) ? value : [];
  return (
    <View className="flex-row flex-wrap gap-2">
      {attr.values.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <Button
            key={option.id}
            size="sm"
            variant={isSelected ? "solid" : "outline"}
            action={isSelected ? "primary" : "neutral"}
            onPress={() => {
              const next = isSelected
                ? selectedIds.filter((id) => id !== option.id)
                : [...selectedIds, option.id];
              onChange(next);
            }}
          >
            <ButtonText>{option.value}</ButtonText>
          </Button>
        );
      })}
    </View>
  );
})
```

Aggiungere i seguenti import che mancano attualmente:
- `Input`, `InputField` da `@/components/ui/input`
- `Button`, `ButtonText` da `@/components/ui/button`
- `HStack` da `@/components/ui/hstack`
- `VStack` da `@/components/ui/vstack`
- `Small` da `@/components/ui/typography`

---

### Step 4 - Aggiornare `app/listings/create.tsx`

#### 4a. Aggiornare il tipo `FormValues`

Il campo `attributes` deve supportare anche `number[]` (per `multi_select`):

```typescript
type FormValues = {
  name: string;
  description: string;
  price: number;
  categoryId: number | null;
  attributes: Record<string, string | boolean | number[]>;
};
```

#### 4b. Aggiornare la logica `onSubmit`

La costruzione dell'array `attributeValues` nel `onSubmit` del formik deve gestire tutti i tipi. Importare il nuovo tipo `CreateListingAttribute` da `types/backend.ts`:

```typescript
const attributeValues: CreateListingAttribute[] = [];

if (attributesQuery.data) {
  for (const attr of attributesQuery.data) {
    const rawValue = values.attributes[String(attr.attributeId)];
    if (rawValue === undefined || rawValue === "") continue;

    match(attr.type)
      .with("select", () => {
        attributeValues.push({
          attributeId: attr.attributeId,
          valueId: Number(rawValue),
        });
      })
      .with("boolean", () => {
        attributeValues.push({
          attributeId: attr.attributeId,
          valueBool: rawValue as boolean,
        });
      })
      .with("text", () => {
        attributeValues.push({
          attributeId: attr.attributeId,
          valueText: rawValue as string,
        });
      })
      .with("range", () => {
        attributeValues.push({
          attributeId: attr.attributeId,
          valueText: String(rawValue),
        });
      })
      .with("date", () => {
        attributeValues.push({
          attributeId: attr.attributeId,
          valueText: rawValue as string,
        });
      })
      .with("multi_select", () => {
        const ids = rawValue as number[];
        if (ids.length > 0) {
          attributeValues.push({
            attributeId: attr.attributeId,
            valueIds: ids,
          });
        }
      })
      .otherwise(() => {});
  }
}
```

#### 4c. Aggiornare la validazione `hasAllRequiredAttributes`

Per `multi_select`, la validazione deve controllare che l'array non sia vuoto:

```typescript
const hasAllRequiredAttributes = (attributesQuery.data ?? [])
  .filter((a) => a.required)
  .every((a) => {
    const val = values.attributes[String(a.attributeId)];
    if (val === undefined || val === "") return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  });
```

---

### Step 5 - Aggiornare `hooks/listings/use-create-listing.ts`

Cambiare il tipo del campo `attributes` in `CreateProductParams`:

```typescript
import { CreateListingAttribute, Listing } from "@/types/backend";

type CreateProductParams = {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  attributes: CreateListingAttribute[];
};
```

Rimuovere l'import di `ListingAttributeValue` che non serve piu' qui.

---

### Step 6 - Aggiornare `app/categories/[slug].tsx` (filtri)

#### 6a. Aggiornare il tipo `AttributeFormValues`

Attualmente e' `Record<string, string | boolean>`. Deve supportare anche range (come tupla o stringa), array per multi_select:

```typescript
type AttributeFormValues = Record<string, string | boolean | number[]>;
```

#### 6b. Aggiornare `AttributeField` (action sheet filters)

Aggiungere i nuovi tipi nel `match(attr.type)`:

- **`text`**: `Input`/`InputField` per filtrare per testo.
- **`range`**: Due `Input`/`InputField` affiancati (min e max) con label dell'unita'. Il valore nel form sara' una stringa `"min,max"` per poter costruire il query param `attr_X=min,max`.
- **`date`**: Un `Input`/`InputField` con placeholder `"YYYY-MM-DD"`.
- **`multi_select`**: Lista di `Button` toggle (come nel form field dello Step 3).

Per il campo **range** nel filtro, salvare il valore come stringa `"min,max"` nel form:

```tsx
.with("range", () => (
  <Controller
    control={control}
    name={String(attr.attributeId)}
    defaultValue=""
    render={({ field: { value, onChange } }) => {
      const parts = typeof value === "string" ? value.split(",") : ["", ""];
      const minVal = parts[0] ?? "";
      const maxVal = parts[1] ?? "";
      return (
        <VStack space="xs">
          <HStack space="sm" className="items-center">
            <VStack space="xs" className="flex-1">
              <Small className="text-arkaic-muted">Min</Small>
              <Input>
                <InputField
                  placeholder={String(attr.rangeMin ?? 0)}
                  value={minVal}
                  onChangeText={(v) => onChange(`${v},${maxVal}`)}
                  keyboardType="numeric"
                />
              </Input>
            </VStack>
            <VStack space="xs" className="flex-1">
              <Small className="text-arkaic-muted">Max</Small>
              <Input>
                <InputField
                  placeholder={String(attr.rangeMax ?? "")}
                  value={maxVal}
                  onChangeText={(v) => onChange(`${minVal},${v}`)}
                  keyboardType="numeric"
                />
              </Input>
            </VStack>
            {attr.rangeUnit ? (
              <Small className="text-arkaic-muted">{attr.rangeUnit}</Small>
            ) : null}
          </HStack>
        </VStack>
      );
    }}
  />
))
```

#### 6c. Aggiornare `AttributeChip` (horizontal filter row)

Attualmente i chip filtrano solo `select` e `boolean`. Aggiungere:

- **`multi_select`**: mostrare come un `Select` (dropdown) simile a `select` -- per i chip orizzontali e' sufficiente un select singolo (il filtro avanzato nell'action sheet usera' i toggle button).
- **`range`**: NON mostrare come chip (troppo complesso per lo spazio orizzontale). Filtrare `range` e `date` dalla lista dei chip come gia' viene fatto per `boolean`:

```typescript
filter(attributes, ({ type }) => type !== "boolean" && type !== "range" && type !== "date")
```

- **`text`**: NON mostrare come chip (non ha senso un filtro per testo libero nella riga orizzontale).

Quindi aggiornare il filtro nella riga chip da:
```typescript
filter(attributes, ({ type }) => type !== "boolean")
```
a:
```typescript
filter(attributes, ({ type }) => type === "select" || type === "multi_select")
```

Per `multi_select` il chip puo' riusare lo stesso componente `Select` usato per `select`.

#### 6d. (Futuro/opzionale) Hook per fetch listing filtrati per attributo

Attualmente la pagina categoria non ha un hook per fetchare listing filtrati. I filtri vengono solo loggati in console (`console.log("Category attribute form values:", values)`). Questo step e' fuori scope per ora -- l'importante e' che i form values vengano costruiti correttamente per i nuovi tipi. Quando sara' il momento di implementare il fetch filtrato, i parametri query dovranno essere costruiti cosi':
- `select`: `?attr_{id}={valueId}`
- `boolean`: `?attr_{id}=true|false`
- `range`: `?attr_{id}=min,max` (es. `?attr_5=0,100000`)
- `multi_select`: `?attr_{id}=val1,val2,val3`

Lasciare il `console.log` esistente per ora.

---

## Ordine di implementazione

1. **`types/backend.ts`** -- sempre per primo, definisce i contratti
2. **`components/listing/attribute-display.tsx`** -- puro display, nessuna dipendenza
3. **`components/listing/attribute-form-field.tsx`** -- form field generico
4. **`hooks/listings/use-create-listing.ts`** -- aggiornare il tipo params
5. **`app/listings/create.tsx`** -- integra il form field aggiornato e il payload corretto
6. **`app/categories/[slug].tsx`** -- aggiornare filtri (chip + action sheet)

## Vincoli tecnici

- Usare `yarn` (mai `npm`)
- **ts-pattern**: ogni `match` termina con `.otherwise()` -- MAI `if/else` o `switch` per logica su tipo attributo
- **NativeWind** per lo styling (classi Tailwind, dark mode supportato)
- Componenti Gluestack UI dove disponibili (Button, Input, Select, Switch, FormControl)
- Tipografia semantica: `Small`, `P`, `Muted` da `@/components/ui/typography`
- **Non esiste** un componente Checkbox o Slider nel progetto -- per `multi_select` usare Button toggle, per `range` usare Input numerici
- **Non esiste** un DatePicker nel progetto -- per `date` usare un semplice Input con placeholder `"YYYY-MM-DD"`
- Tutti gli import usano il path alias `@/`
- Named exports per i componenti (no default export per componenti non-page)
- I tipi usano `type` (non `interface`)

## Criteri di accettazione

- [ ] Il tipo `AttributeType` include tutti e 6 i valori: `select`, `boolean`, `text`, `range`, `date`, `multi_select`
- [ ] `CategoryAttribute` ha i campi `rangeMin`, `rangeMax`, `rangeStep`, `rangeUnit` opzionali
- [ ] `ListingAttributeValue` ha i campi `valueText`, `valueFloat`, `multiValues`
- [ ] Esiste un tipo `CreateListingAttribute` per il payload di creazione
- [ ] `AttributeDisplay` mostra correttamente tutti i 6 tipi di attributo
- [ ] `AttributeFormField` rende un input appropriato per ognuno dei 6 tipi
- [ ] Il form di creazione listing costruisce il payload corretto per ogni tipo di attributo (select: valueId, boolean: valueBool, text/range/date: valueText, multi_select: valueIds)
- [ ] `use-create-listing.ts` usa `CreateListingAttribute[]` come tipo per gli attributi
- [ ] I filtri nella pagina categoria gestiscono i nuovi tipi (range con min/max, multi_select come toggle)
- [ ] I chip orizzontali mostrano solo `select` e `multi_select`
- [ ] Tutti i `match` terminano con `.otherwise()`
- [ ] Nessun `any` o cast non sicuro introdotto
- [ ] L'app compila senza errori TypeScript

## Note per il reviewer

- Verificare che il tipo discriminated union `CreateListingAttribute` sia corretto rispetto al contratto backend (campi mutuamente esclusivi per tipo)
- Verificare che `AttributeDisplay` gestisca correttamente i casi `null`/`undefined` per i nuovi campi (`valueText`, `valueFloat`, `multiValues`)
- Verificare la coerenza dei `match` pattern in tutti i file -- devono coprire tutti e 6 i tipi
- Il campo `value` (per select singolo) in `AttributeFormField` usa `String(option.id)` come value del `SelectItem` -- verificare che il `Number(rawValue)` in `create.tsx` lo converta correttamente
- Per `multi_select` nel form, il valore e' un `number[]` -- verificare che formik gestisca correttamente array come valore di un campo
- I filtri range nella pagina categoria usano il formato stringa `"min,max"` -- questo e' un formato interno al form, non il formato query param finale (che sara' costruito quando si implementera' il fetch)
- Non ci sono slider o checkbox Gluestack -- le soluzioni con Button toggle e Input numerici sono intenzionali
