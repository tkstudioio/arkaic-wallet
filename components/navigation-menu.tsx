import { Href, Link, usePathname } from "expo-router";
import { toString } from "lodash";
import {
  Home,
  LucideIcon,
  MessagesSquare,
  Plus,
  Settings,
  Wallet,
} from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";

const tabs: { label: string; icon: LucideIcon; path: Href }[] = [
  { label: "Home", icon: Home, path: "/categories" },
  { label: "Sell", icon: Plus, path: "/listings/create" },
  // { label: "My listings", icon: User, path: "/listings/my-listings" },
  { label: "Chats", icon: MessagesSquare, path: "/chats" },
  { label: "Wallet", icon: Wallet, path: "/account/dashboard" },
  { label: "Settings", icon: Settings, path: "/account/settings" },
];

export default function NavigationMenu() {
  const pathname = usePathname();

  return (
    <Card>
      <HStack space={"xl"}>
        {tabs.map((tab) => {
          const isActive = pathname === toString(tab.path);
          const Icon = tab.icon;

          return (
            <Link key={toString(tab.path)} asChild href={tab.path}>
              <Button
                variant={isActive ? undefined : "link"}
                action={isActive ? undefined : "neutral"}
                size={"sm"}
                className={
                  "flex-1 items-center justify-center w-full aspect-square flex-col px-0 "
                }
              >
                <ButtonIcon as={Icon} size={"md"} />
                <ButtonText>{tab.label}</ButtonText>
              </Button>
            </Link>
          );
        })}
      </HStack>
    </Card>
  );
}
