import AppLayout from "@/components/layout/app-layout";

import { TransactionsHistory } from "@/components/transactions-history";
import { Text } from "@/components/ui/text";

import { useRouter } from "expo-router";
import { map } from "lodash";
import { Plus, Send } from "lucide-react-native";
import { Button, ButtonIcon } from "../../components/ui/button";
import { VStack } from "../../components/ui/vstack";

import { BalanceCarousel } from "@/components/balance-carousel";
import { HStack } from "@/components/ui/hstack";
import React from "react";

export default function DashboardPage() {
  const router = useRouter();

  const actions = [
    {
      onPress: () => router.push("/dashboard/receive"),
      icon: Plus,
      label: "Receive",
    },
    {
      onPress: () => router.push("/dashboard/send"),
      icon: Send,
      label: "Send",
    },
  ];

  return (
    <AppLayout>
      <BalanceCarousel />
      <VStack className='px-6 border' space={"lg"}>
        <HStack className='justify-around'>
          {map(actions, (action, idx) => (
            <VStack key={idx} className='items-center w-max'>
              <Button
                action={"secondary"}
                className='flex-col w-max h-max rounded-full size-14'
                onPress={action.onPress}
              >
                <ButtonIcon as={action.icon} />
              </Button>
              <Text>{action.label}</Text>
            </VStack>
          ))}
        </HStack>
        <TransactionsHistory />
      </VStack>
    </AppLayout>
  );
}
