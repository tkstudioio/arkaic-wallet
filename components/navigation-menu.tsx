import { Href, usePathname, useRouter } from "expo-router";
import { toString } from "lodash";
import {
  LucideIcon,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Wallet,
} from "lucide-react-native";
import { cssInterop } from "nativewind";
import { Button, ButtonIcon } from "./ui/button";
import { Card } from "./ui/card";

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
cssInterop(Settings, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});
cssInterop(ShoppingBag, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});
cssInterop(ShoppingCart, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

const tabs = [
  { label: "Wallet", icon: Wallet, path: "/account/dashboard" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Sell", icon: Plus, path: "/products/create" },
  { label: "Selling", icon: ShoppingBag, path: "/account/selling" },
  { label: "Buying", icon: ShoppingCart, path: "/account/buying" },
  { label: "Settings", icon: Settings, path: "/account/settings" },
] as { label: string; icon: LucideIcon; path: Href }[];

export default function NavigationMenu() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Card className='flex-row'>
      {tabs.map((tab) => {
        const isActive = pathname === toString(tab.path);
        const Icon = tab.icon;

        return (
          <Button
            variant={isActive ? undefined : "link"}
            action={isActive ? undefined : "neutral"}
            key={toString(tab.path)}
            size="sm"
            className={"flex-1 items-center justify-center"}
            onPress={() => router.push(tab.path)}
          >
            <ButtonIcon as={Icon} size="sm" />
          </Button>
        );
      })}
    </Card>
  );
}
