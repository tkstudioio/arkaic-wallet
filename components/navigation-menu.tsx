import { useColorScheme } from "@/hooks/arkade/use-color-scheme";
import { usePathname, useRouter } from "expo-router";
import { Package, Wallet } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Small } from "./ui/typography";

const tabs = [
  { label: "Wallet", icon: Wallet, path: "/dashboard" },
  { label: "Products", icon: Package, path: "/products" },
] as const;

const activeColor = {
  light: "rgb(113, 56, 113)",
  dark: "rgb(136, 39, 138)",
};

const inactiveColor = {
  light: "rgb(118, 118, 118)",
  dark: "rgb(168, 168, 168)",
};

export default function NavigationMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { bottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View
      className='flex-row bg-arkaic-background border-t border-arkaic-border'
      style={{ paddingBottom: bottom }}
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.path);
        const iconColor = isActive
          ? activeColor[colorScheme]
          : inactiveColor[colorScheme];

        return (
          <Pressable
            key={tab.path}
            className='flex-1 items-center pt-3 pb-2'
            onPress={() => router.push(tab.path)}
          >
            <tab.icon size={22} color={iconColor} />
            <Small
              className={
                isActive
                  ? "text-arkaic-primary mt-1"
                  : "text-arkaic-muted mt-1"
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
