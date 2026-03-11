import { AccountBalance } from "@/components/account-balance";
import { ReceiveActionSheet } from "@/components/receive-action-sheet";
import { SendActionSheet } from "@/components/send-action-sheet";
import { Transactions } from "@/components/transactions";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { H1 } from "@/components/ui/typography";
import useAccountStore from "@/stores/account";

import React from "react";
import { View } from "react-native";

const DashboardPage = () => {
  const { account } = useAccountStore();

  return (
    <>
      <H1>Dashbooard</H1>
      <AccountBalance account={account!} />
      <Card variant={"ghost"}>
        <HStack className='w-full' space={"md"}>
          <View className='flex-1'>
            <ReceiveActionSheet />
          </View>
          <View className='flex-1'>
            <SendActionSheet />
          </View>
        </HStack>
      </Card>
      <Transactions />
    </>
  );
};
export default DashboardPage;
