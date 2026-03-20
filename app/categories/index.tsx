import { ListingItem } from "@/components/listing-item";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Muted, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategories } from "@/hooks/categories/use-categories";
import { Category, Listing } from "@/types/backend";
import { Link } from "expo-router";
import { icons, Search, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { match } from "ts-pattern";

const MOCK_FAVORITES: Listing[] = [
  {
    id: 9001,
    sellerPubkey: "mock-pubkey-1",
    seller: {
      pubkey: "mock-pubkey-1",
      username: "alice",
      createdAt: new Date("2025-01-01"),
      isArbiter: false,
    },
    signature: "mock-sig",
    name: "Vintage Keyboard",
    description: "Mechanical keyboard in great condition",
    price: 50000,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: 9002,
    sellerPubkey: "mock-pubkey-2",
    seller: {
      pubkey: "mock-pubkey-2",
      username: "bob",
      createdAt: new Date("2025-01-01"),
      isArbiter: false,
    },
    signature: "mock-sig",
    name: "Bitcoin Hardware Wallet",
    description: "Brand new, sealed",
    price: 120000,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: 9003,
    sellerPubkey: "mock-pubkey-3",
    seller: {
      pubkey: "mock-pubkey-3",
      username: "carol",
      createdAt: new Date("2025-01-01"),
      isArbiter: false,
    },
    signature: "mock-sig",
    name: "Programming Book",
    description: "Clean Code by Robert C. Martin",
    price: 15000,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: 9004,
    sellerPubkey: "mock-pubkey-4",
    seller: {
      pubkey: "mock-pubkey-4",
      username: "dave",
      createdAt: new Date("2025-01-01"),
      isArbiter: false,
    },
    signature: "mock-sig",
    name: "USB-C Hub",
    description: "7-in-1 multiport adapter",
    price: 35000,
    createdAt: new Date("2025-01-01"),
  },
];

/** Convert kebab-case icon name to PascalCase and resolve from lucide */
function getCategoryIcon(iconName: string | null): LucideIcon | null {
  if (!iconName) return null;
  const pascalCase = iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return (icons as Record<string, LucideIcon>)[pascalCase] ?? null;
}

/** Convert hex color to a lighter background (20% opacity) */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function CategoryCircle({ category }: { category: Category }) {
  const IconComponent = getCategoryIcon(category.iconName);
  const color = category.color ?? "#6b7280";

  return (
    <Link href={`/categories/${category.slug}`} asChild>
      <Pressable className='items-center gap-2'>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: hexToRgba(color, 0.15),
            borderWidth: 1.5,
            borderColor: hexToRgba(color, 0.3),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {IconComponent ? (
            <IconComponent size={28} color={color} strokeWidth={1.8} />
          ) : (
            <Small style={{ color }}>{category.name.charAt(0)}</Small>
          )}
        </View>
        <Small style={{ color }} className='font-heading text-center'>
          {category.name}
        </Small>
      </Pressable>
    </Link>
  );
}

export default function CategoriesIndex() {
  const categoriesQuery = useCategories();
  const [search, setSearch] = useState("");

  return (
    <VStack space='xl' className='px-4 pt-4 pb-2'>
      {/* Search bar */}
      <Input size='lg' className='border-solid rounded-xl bg-arkaic-card'>
        <InputSlot className='pl-3'>
          <InputIcon as={Search} />
        </InputSlot>
        <InputField
          placeholder='Search listings...'
          value={search}
          onChangeText={setSearch}
          returnKeyType='search'
        />
      </Input>

      {/* Categories */}
      <VStack space='sm'>
        {match(categoriesQuery)
          .with({ isLoading: true }, () => <Spinner />)
          .with({ isError: true }, () => (
            <Muted>Failed to load categories.</Muted>
          ))
          .otherwise(({ data: categories }) =>
            categories && categories.length > 0 ? (
              <View className='flex-row flex-wrap justify-around py-2'>
                {categories.map((category) => (
                  <View
                    key={category.slug}
                    className='flex-1 items-center min-w-[80px] max-w-[120px] mb-4'
                  >
                    <CategoryCircle category={category} />
                  </View>
                ))}
              </View>
            ) : null,
          )}
      </VStack>

      {/* Favorites */}
      <VStack space='sm'>
        <P className='font-heading text-arkaic-foreground'>Favorites</P>
        <View className='flex-row flex-wrap gap-3'>
          {MOCK_FAVORITES.map((listing) => (
            <View key={listing.id} className='flex-1 min-w-[45%]'>
              <ListingItem listing={listing} />
            </View>
          ))}
        </View>
      </VStack>
    </VStack>
  );
}
