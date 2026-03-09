import { usePathname, useRouter } from "expo-router";
import { Package, Wallet } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Small } from "./ui/typography";

cssInterop(Wallet, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});
cssInterop(Package, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

const tabs = [
  { label: "Wallet", icon: Wallet, path: "/dashboard" },
  { label: "Products", icon: Package, path: "/products" },
] as const;

export default function NavigationMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      className='flex-row bg-arkaic-fill border-t border-arkaic-border'
      style={{ paddingBottom: bottom }}
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.path);
        const Icon = tab.icon;

        return (
          <Pressable
            key={tab.path}
            className='flex-1 items-center justify-center py-3 gap-1'
            onPress={() => router.push(tab.path)}
          >
            <Icon
              size={20}
              className={
                isActive ? "text-arkaic-primary" : "text-arkaic-muted"
              }
            />
            <Small
              className={
                isActive
                  ? "text-arkaic-primary font-heading"
                  : "text-arkaic-muted"
              }
            >
              {tab.label}
            </Small>
          </Pressable>
        );
      })}
    </View>
  );
}
