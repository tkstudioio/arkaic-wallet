import AppLayout from "@/components/layout/app-layout";

import { ArkaicOperationsList } from "@/components/arkaic-operations-list";

import { useRouter } from "expo-router";
import { Plus, Send } from "lucide-react-native";

import { BalanceCarousel } from "@/components/balance-carousel";
import { OnchainTransactionsList } from "@/components/onchain-transactions-list";
import { Button, ButtonIcon } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import useSettingsStore, { ChainSetting } from "@/stores/settings";
import { map } from "lodash";
import React from "react";
import { match } from "ts-pattern";

export default function DashboardPage() {
  const router = useRouter();
  const { chain } = useSettingsStore();

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

      <VStack className='px-6'>
        {match(chain)
          .with(ChainSetting.Ark, () => <ArkaicOperationsList />)
          .with(ChainSetting.Onchain, () => <OnchainTransactionsList />)
          .exhaustive()}
      </VStack>
    </AppLayout>
  );
}
