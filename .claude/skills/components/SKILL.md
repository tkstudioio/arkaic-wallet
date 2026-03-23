---
description: Create, read, and modify UI components using Gluestack base primitives following project conventions
---

# components

Build React Native UI components using the Gluestack-based design system in `components/ui/`. All custom components live in `components/<domain>/` and follow a strict set of conventions.

---

## File Location & Naming

| What | Convention | Example |
|------|-----------|---------|
| Directory | `components/<domain>/` | `components/listing/` |
| File | `<component-name>.tsx` in kebab-case | `price-tag.tsx` |
| Full path | `components/<domain>/<component-name>.tsx` | `components/listing/price-tag.tsx` |
| Export name | PascalCase + `Component` suffix | `PriceTagComponent` |
| Export type | Named export only | `export function PriceTagComponent` |

> One named export per file. Never use `default export` for custom components.

---

## Component Anatomy

Every component follows this structure:

```tsx
import { HStack } from "@/components/ui/hstack";
import { Large, Small } from "@/components/ui/typography";

type Props = {
  label: string;
  amount: number;
  className?: string;
};

export function PriceTagComponent(props: Props) {
  return (
    <HStack className={props.className} space="sm">
      <Small>{props.label}</Small>
      <Large>{props.amount}</Large>
    </HStack>
  );
}
```

### Key rules

- `type Props` is declared **directly above** the component, never exported
- Props are accessed via `props.field` inside the component body
- Use `(props: Props)` as the function signature — not inline destructuring in the signature

---

## Props Destructuring Variants

### Default — `props.field`

Use when only a few fields are accessed:

```tsx
type Props = {
  title: string;
  subtitle?: string;
};

export function CardHeaderComponent(props: Props) {
  return (
    <VStack>
      <Large>{props.title}</Large>
      {props.subtitle && <Small>{props.subtitle}</Small>}
    </VStack>
  );
}
```

### Destructuring with `...rest`

Use when you need to forward most props to a child (e.g., wrapping a Gluestack primitive):

```tsx
type Props = {
  className?: string;
  label: string;
} & React.ComponentProps<typeof Pressable>;

export function TappableCardComponent({ className, label, ...rest }: Props) {
  return (
    <Pressable className={`rounded-arkaic-button ${className ?? ""}`} {...rest}>
      <Large>{label}</Large>
    </Pressable>
  );
}
```

> Only use `...rest` when you genuinely need to forward extra props to a child. Do not use it as a shortcut to avoid typing.

---

## Available Base UI Components

These are already installed in `components/ui/`. **Do NOT install new Gluestack components without explicit user approval.**

### Layout

| Import | Components |
|--------|-----------|
| `@/components/ui/vstack` | `VStack` |
| `@/components/ui/hstack` | `HStack` |
| `@/components/ui/grid` | `Grid`, `GridItem` |
| `@/components/ui/card` | `Card` |
| `@/components/ui/divider` | `Divider` |

### Typography

| Import | Components |
|--------|-----------|
| `@/components/ui/typography` | `H1`, `P`, `Large`, `Small`, `Muted` |
| `@/components/ui/text` | `Text` (generic, with `size` prop) |
| `@/components/ui/heading` | `Heading` |

### Inputs & Forms

| Import | Components |
|--------|-----------|
| `@/components/ui/button` | `Button`, `ButtonText`, `ButtonIcon`, `ButtonSpinner`, `ButtonGroup` |
| `@/components/ui/input` | `Input`, `InputField`, `InputIcon`, `InputSlot` |
| `@/components/ui/switch` | `Switch` |
| `@/components/ui/select` | `Select`, `SelectTrigger`, `SelectInput`, `SelectIcon`, `SelectPortal`, `SelectBackdrop`, `SelectContent`, `SelectDragIndicator`, `SelectDragIndicatorWrapper`, `SelectItem`, `SelectScrollView`, `SelectFlatList`, `SelectVirtualizedList`, `SelectSectionList`, `SelectSectionHeaderText` |
| `@/components/ui/form-control` | `FormControl`, `FormControlLabel`, `FormControlLabelText`, `FormControlLabelAstrick`, `FormControlHelper`, `FormControlHelperText`, `FormControlError`, `FormControlErrorText`, `FormControlErrorIcon` |

### Feedback & Display

| Import | Components |
|--------|-----------|
| `@/components/ui/badge` | `Badge`, `BadgeText`, `BadgeIcon` |
| `@/components/ui/spinner` | `Spinner` |
| `@/components/ui/skeleton` | `Skeleton`, `SkeletonText` |
| `@/components/ui/avatar` | `Avatar`, `AvatarImage`, `AvatarFallbackText`, `AvatarBadge`, `AvatarGroup` |
| `@/components/ui/icon` | `Icon` + icon primitives (see Icons section) |
| `@/components/ui/table` | `Table`, and sub-parts |

### Overlays

| Import | Components |
|--------|-----------|
| `@/components/ui/modal` | `Modal`, `ModalBackdrop`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`, `ModalCloseButton` |
| `@/components/ui/actionsheet` | `Actionsheet`, `ActionsheetContent`, `ActionsheetItem`, `ActionsheetItemText`, `ActionsheetDragIndicator`, `ActionsheetDragIndicatorWrapper`, `ActionsheetBackdrop`, `ActionsheetScrollView`, `ActionsheetFlatList`, `ActionsheetVirtualizedList`, `ActionsheetSectionList`, `ActionsheetSectionHeaderText`, `ActionsheetIcon` |
| `@/components/ui/drawer` | `Drawer`, `DrawerBackdrop`, `DrawerContent`, `DrawerHeader`, `DrawerBody`, `DrawerFooter`, `DrawerCloseButton` |
| `@/components/ui/menu` | `Menu`, `MenuItem`, `MenuItemLabel`, `MenuItemIcon`, `MenuSeparator` |
| `@/components/ui/alert-dialog` | `AlertDialog` and sub-parts |

---

## Icons

Use `lucide-react-native` for icons (already installed). Do not install icon libraries.

```tsx
import { Heart, ArrowRight } from "lucide-react-native";

// Standalone
<Heart size={18} className="text-arkaic-primary" />

// With Gluestack Icon wrapper
import { Icon } from "@/components/ui/icon";
<Icon as={Heart} size="sm" />
```

---

## Styling with NativeWind / Tailwind

All styling uses NativeWind (Tailwind classes via `className`). Use project design tokens:

| Token | Usage |
|-------|-------|
| `text-arkaic-foreground` | Primary text |
| `text-arkaic-muted` | Secondary/muted text |
| `text-arkaic-primary` | Brand accent |
| `bg-arkaic-background` | Page/surface background |
| `bg-arkaic-primary` | Brand button background |
| `bg-arkaic-positive` | Success/buy |
| `bg-arkaic-negative` | Error/sell |
| `rounded-arkaic-button` | Consistent border radius |
| `rounded-arkaic-md` / `rounded-arkaic-sm` | Spacing tokens |

To merge class names conditionally:

```tsx
import { cnBase } from "tailwind-variants";

<HStack className={cnBase("items-center", props.className)} />
```

---

## Common Patterns

### Loading state

```tsx
import { Spinner } from "@/components/ui/spinner";

if (query.isPending) return <Spinner />;
```

### Skeleton placeholder

```tsx
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

<Skeleton className="h-20 w-full rounded-arkaic-button" />
<SkeletonText _lines={3} />
```

### Full example — domain component

```tsx
// components/listing/seller-badge.tsx
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { Small } from "@/components/ui/typography";

type Props = {
  username: string;
  className?: string;
};

export function SellerBadgeComponent(props: Props) {
  return (
    <HStack className={props.className} space="sm" style={{ alignItems: "center" }}>
      <Avatar size="sm">
        <AvatarFallbackText>{props.username}</AvatarFallbackText>
      </Avatar>
      <Small>{props.username}</Small>
    </HStack>
  );
}
```

---

## Import Rules

Always use `@/` path aliases — never relative paths:

```tsx
// ✅ Good
import { Card } from "@/components/ui/card";
import { SellerBadgeComponent } from "@/components/listing/seller-badge";

// ❌ Avoid
import { Card } from "../../components/ui/card";
```

---

## Gluestack Installation Policy

**Never run `npx gluestack-ui add <component>` or install new Gluestack components without explicit user approval.** All currently available base components are listed above. If a needed primitive is missing, ask the user first.

---

## Verification Checklist

Before committing a new or modified component:

- [ ] File is at `components/<domain>/<component-name>.tsx` (kebab-case filename)
- [ ] Component name is PascalCase + `Component` suffix
- [ ] Single named export — no default export
- [ ] `type Props` declared above the component, not exported
- [ ] Props accessed via `props.field` (or `{ field, ...rest }: Props` when spreading)
- [ ] All base UI imports use `@/components/ui/<name>`
- [ ] All other imports use `@/` alias
- [ ] No new Gluestack packages installed without user approval
- [ ] Styling uses NativeWind classes and project design tokens
