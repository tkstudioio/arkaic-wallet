import { AccountBalance } from "@/components/account-balance";
import AppLayout from "@/components/layout/app-layout";
import { ReceiveActionSheet } from "@/components/receive-action-sheet";
import { SendActionSheet } from "@/components/send-action-sheet";
import { Transactions } from "@/components/transactions";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import useAccountStore from "@/stores/account";

import React from "react";
import { match } from "ts-pattern";

const DashboardPage = () => {
  const { account } = useAccountStore();

  return (
    <AppLayout>
      {match(account)
        .with(undefined, () => <Text>Ciro</Text>)
        .otherwise((account) => (
          <VStack className='px-arkaic-md' space={"4xl"}>
            <Card className='flex-1 w-full aspect-video items-center justify-center'>
              <AccountBalance account={account} />
            </Card>
            <HStack className='justify-around w-full'>
              <ReceiveActionSheet />
              <SendActionSheet />
            </HStack>
            <Transactions />
          </VStack>
        ))}
    </AppLayout>
  );
};
export default DashboardPage;
