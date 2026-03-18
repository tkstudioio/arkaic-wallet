# Task: Add categories support to the marketplace

## Context

The backend now exposes a Categories API (`GET /api/categories` and `GET /api/categories/:slug`) that provides a hierarchical taxonomy for organizing marketplace listings. Categories are read-only, seeded by the server (e.g., Clothing > Shoes, Bags; Electronics > Phones, Laptops). Listings reference categories via the existing `ListingCategory` join type.

The client needs to:
1. Fetch and display categories
2. Allow sellers to assign categories when creating a listing
3. Allow buyers to filter listings by category when browsing the marketplace

## Objective

After this task the developer will have:
- Updated the `Category` backend type to include the `slug` field
- Created React Query hooks for fetching categories
- Integrated a category picker into the listing creation form
- Integrated category-based filtering into the listings browse screen
- Displayed category badges on listing items

## File coinvolti

### Files to READ (understand patterns)
- `types/backend.ts` — existing types including `Category`, `ListingCategory`, `Listing`
- `lib/api.ts` — backend axios client
- `hooks/listings/use-listings.ts` — query pattern for listings
- `hooks/listings/use-create-listing.ts` — mutation pattern for create listing
- `app/listings/index.tsx` — listings browse screen
- `app/listings/create.tsx` — listing creation form
- `components/listing-item.tsx` — listing card component
- `components/ui/select/index.tsx` — Gluestack Select component (for the category picker)
- `components/ui/badge/index.tsx` — Badge component (for category display)

### Files to MODIFY
- `types/backend.ts` — add `slug` field to `Category`
- `hooks/listings/use-create-listing.ts` — add `categoryIds` to create params
- `app/listings/index.tsx` — add category filter UI
- `app/listings/create.tsx` — add category picker to the form
- `components/listing-item.tsx` — display category badges

### Files to CREATE
- `hooks/categories/use-categories.ts` — fetch root categories
- `hooks/categories/use-category.ts` — fetch single category by slug (with children)
- `components/category-picker.tsx` — reusable category picker component
- `components/category-badge.tsx` — reusable category badge component

## Implementazione dettagliata

### Step 1 — Update `Category` type in `types/backend.ts`

The existing `Category` type is missing the `slug` field returned by the API. Update it:

```typescript
export type Category = {
  id: number;
  name: string;
  slug: string; // <-- ADD THIS
  childrenOf: number | null;

  parent?: Category | null;
  children?: Category[];

  listings?: ListingCategory[];
};
```

No other types need modification. The `Listing` type already has `categories?: ListingCategory[]` and `ListingCategory` already references `Category`.

### Step 2 — Create `hooks/categories/use-categories.ts`

Follow the same pattern as `hooks/listings/use-listings.ts`.

```typescript
// hooks/categories/use-categories.ts
import { backend } from "@/lib/api";
import { Category } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await backend.get("/categories");
      return data;
    },
    staleTime: 1000 * 60 * 60, // categories rarely change, cache for 1 hour
  });
}
```

Query key: `["categories"]`

### Step 3 — Create `hooks/categories/use-category.ts`

Fetch a single category by slug, returns the category with its direct children.

```typescript
// hooks/categories/use-category.ts
import { backend } from "@/lib/api";
import { Category } from "@/types/backend";
import { useQuery } from "@tanstack/react-query";

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async (): Promise<Category> => {
      const { data } = await backend.get(`/categories/${slug}`);
      return data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 60,
  });
}
```

Query key: `["category", slug]`

### Step 4 — Create `components/category-badge.tsx`

A small reusable component that renders a category name inside a Badge. Used in `ListingItem` and the listing detail screen.

```typescript
// components/category-badge.tsx
import { Badge, BadgeText } from "@/components/ui/badge";
import { Category } from "@/types/backend";

type Props = {
  category: Category;
};

export function CategoryBadge({ category }: Props) {
  return (
    <Badge size="sm" variant="outline">
      <BadgeText>{category.name}</BadgeText>
    </Badge>
  );
}
```

### Step 5 — Create `components/category-picker.tsx`

A reusable category picker component for the listing creation form. It fetches root categories using `useCategories`, then shows a Gluestack `Select` component. When a root category is selected, if it has children, show a second `Select` for the subcategory.

The component receives a callback `onSelect(categoryId: number)` and an optional `selectedCategoryId`.

Use the Gluestack Select component from `@/components/ui/select`:

```typescript
// components/category-picker.tsx
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from "@/components/ui/select";
import { VStack } from "@/components/ui/vstack";
import { Small } from "@/components/ui/typography";
import { Spinner } from "@/components/ui/spinner";
import { useCategories } from "@/hooks/categories/use-categories";
import { Category } from "@/types/backend";
import { match } from "ts-pattern";
import { useState, useCallback } from "react";
import { find } from "lodash";

type Props = {
  onSelect: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
};

export function CategoryPicker({ onSelect, selectedCategoryId }: Props) {
  // ... implementation inside
}
```

Implementation requirements:
- Use `useCategories()` to fetch root categories
- Maintain local state `selectedRootSlug` for the first-level selection
- When a root category is selected:
  - If it has non-empty `children` array, show a second `Select` for subcategories
  - If it has no children, call `onSelect(rootCategory.id)` directly
- When a subcategory is selected, call `onSelect(subcategory.id)`
- Use `match` from `ts-pattern` for loading/error/success states of `useCategories()`
- Each `match` must end with `.otherwise()`
- Show a `Spinner` while categories are loading
- Label with `<Small>Category</Small>` above the first select
- Label with `<Small>Subcategory</Small>` above the second select (when visible)
- Wrap everything in a `<VStack space="xs">`

### Step 6 — Integrate category picker into `app/listings/create.tsx`

Modify the listing creation form to include the `CategoryPicker` component.

Changes:
1. Import `CategoryPicker` from `@/components/category-picker`
2. Add `categoryIds` to the Formik `initialValues`: `{ name: "", price: 0, categoryIds: [] as number[] }`
3. Add a `<CategoryPicker>` inside the form, between the price field and the error message. Wire it up:
   ```tsx
   <CategoryPicker
     onSelect={(categoryId) =>
       setFieldValue("categoryIds", categoryId ? [categoryId] : [])
     }
     selectedCategoryId={values.categoryIds[0] ?? null}
   />
   ```
4. The form already submits via `createProduct.mutate(values)` — the `categoryIds` array will be included automatically since it's part of `values`.

### Step 7 — Update `hooks/listings/use-create-listing.ts`

Update `CreateProductParams` to include `categoryIds`:

```typescript
type CreateProductParams = {
  name: string;
  price: number;
  categoryIds?: number[];
};
```

The mutation function body stays the same — `backend.post('/listings', values)` already sends all values.

### Step 8 — Integrate category filter into `app/listings/index.tsx`

Add a horizontal category filter bar at the top of the listings browse screen, above the listings list. The filter lets users tap a root category to see only listings in that category.

Changes:
1. Import `useCategories` from `@/hooks/categories/use-categories`
2. Import `Pressable, ScrollView` from `react-native`
3. Import `Small` from `@/components/ui/typography`
4. Import `match` (already imported)
5. Add local state: `const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)`
6. Fetch categories: `const categoriesQuery = useCategories()`
7. Add a horizontal `ScrollView` (with `horizontal` and `showsHorizontalScrollIndicator={false}`) below the `<H1>` and above the listings `match` block. Inside it:
   - An "All" chip (always present) — `Pressable` with conditional styling based on `selectedCategoryId === null`
   - One chip per root category from `categoriesQuery.data` — `Pressable` with the category name, styled differently when active
   - Each chip is a `Pressable` wrapping a `<Small>` with NativeWind classes for a chip/pill look:
     - Base: `px-3 py-1 rounded-full border border-arkaic-border`
     - Active: `bg-arkaic-primary border-arkaic-primary` with `<Small className="text-arkaic-primary-foreground">`
     - Inactive: `bg-transparent` with `<Small>`
   - Use `match` for the categoriesQuery loading state — show nothing while loading, render chips otherwise
8. Filter the listings data before rendering:
   ```typescript
   const filteredListings = selectedCategoryId
     ? data?.filter((listing) =>
         listing.categories?.some((lc) => lc.categoryId === selectedCategoryId)
       )
     : data;
   ```
   Use `filteredListings` in the `map()` call instead of `data`.

### Step 9 — Display category badges in `components/listing-item.tsx`

Show category badges on each listing card.

Changes:
1. Import `CategoryBadge` from `@/components/category-badge`
2. Import `HStack` from `@/components/ui/hstack`
3. After the seller badge and before the `<Large>` name, add:
   ```tsx
   {listing.categories && listing.categories.length > 0 && (
     <HStack space="xs" className="flex-wrap">
       {listing.categories.map((lc) =>
         lc.category ? (
           <CategoryBadge key={lc.categoryId} category={lc.category} />
         ) : null
       )}
     </HStack>
   )}
   ```

Note: Category badges will only display when the backend response includes the `category` relation in `ListingCategory`. If the backend does not populate this relation, the badges simply won't render (graceful degradation).

## Vincoli tecnici

- Use `yarn` (never `npm`)
- All code, comments, and content in English
- Use `@/` path alias for all imports
- React Query for all async data fetching — never fetch in `useEffect`
- NativeWind for all styling via `className` — never use `StyleSheet.create()`
- Gluestack UI components where available (`Select`, `Badge`, `Spinner`, `Card`, etc.)
- Semantic typography: use `H1`, `P`, `Large`, `Small`, `Muted` from `@/components/ui/typography`
- `ts-pattern`: use `match` for all conditional rendering — every `match` must end with `.otherwise()`
- Named exports for all components (no default exports for components, default exports only for route screens in `app/`)
- Query keys must follow the existing convention: `["categories"]` for the list, `["category", slug]` for a single one
- `staleTime` of 1 hour for categories (they rarely change)
- The `CategoryPicker` must handle the loading state of `useCategories()` gracefully
- The category filter on the listings page operates client-side on the already-fetched listings data (no separate API call with category filter param)
- No breaking changes to existing types or hooks

## Criteri di accettazione

- The `Category` type in `types/backend.ts` includes the `slug` field
- `useCategories()` hook fetches root categories from `GET /api/categories` with query key `["categories"]`
- `useCategory(slug)` hook fetches a specific category from `GET /api/categories/:slug` with query key `["category", slug]`
- The listing creation form includes a category picker that allows selecting one category (root or subcategory)
- The `CreateProductParams` type includes optional `categoryIds` array
- The listings browse screen shows a horizontal category filter bar with "All" + root categories
- Selecting a category chip filters the displayed listings client-side
- `ListingItem` shows category badges when the listing has categories
- All `match` expressions end with `.otherwise()`
- No `any` types, no unsafe casts
- All imports use `@/` alias

## Note per il reviewer

- Verify that the `Category` type `slug` field matches what the backend returns
- Verify query keys are consistent with the patterns in `.claude/docs/packages.md` — suggest adding `["categories"]` and `["category", slug]` to the reference
- Check that `CategoryPicker` handles the case where a root category has no children (should call `onSelect` directly with the root category ID)
- Verify the category filter chips style is consistent with the existing design language (arkaic-primary, arkaic-border, etc.)
- Check that `listing.categories` graceful degradation works — if the backend doesn't include the relation, the UI should not break
- Verify that `staleTime: 1000 * 60 * 60` is appropriate — categories are server-seeded and read-only
- The `CategoryPicker` currently supports selecting only ONE category. If multi-select is needed in the future, the `onSelect` callback and Formik field would need to change, but the current architecture (`categoryIds: number[]`) already supports it
- No new routes are needed — categories are integrated into existing screens
