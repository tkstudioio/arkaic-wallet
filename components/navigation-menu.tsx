import { usePathname, useRouter } from "expo-router";
import { map } from "lodash";
import { Package, Wallet } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ButtonText } from "./ui/button";

const tabs = [
  { label: "Wallet", icon: Wallet, path: "/dashboard" },
  { label: "Products", icon: Package, path: "/products" },
] as const;

export default function NavigationMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { bottom } = useSafeAreaInsets();

  return (
    <View className='flex-row bg-arkaic-fill' style={{ paddingBottom: bottom }}>
      {map(tabs, (tab) => {
        const isActive = pathname.startsWith(tab.path);

        return (
          <Button
            key={tab.path}
            action={isActive ? "primary" : "secondary"}
            onPress={() => router.push(tab.path)}
          >
            <ButtonText>{tab.label}</ButtonText>
          </Button>
        );
      })}
    </View>
  );
}
