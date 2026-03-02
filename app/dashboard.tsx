import { AccountBalance } from "@/components/account-balance";
import AppLayout from "@/components/layout/app-layout";
import { ReceiveActionSheet } from "@/components/receive-action-sheet";
import { SendActionSheet } from "@/components/send-action-sheet";
import { Transactions } from "@/components/transactions";
import { HStack } from "@/components/ui/hstack";
import { P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import useAccountStore from "@/stores/account";

import React from "react";
import { match } from "ts-pattern";

const DashboardPage = () => {
  const { account } = useAccountStore();

  return (
    <AppLayout>
      {match(account)
        .with(undefined, () => <P>Ciro</P>)
        .otherwise((account) => (
          <VStack className='px-arkaic-md flex-1' space={"4xl"}>
            <AccountBalance account={account} />
            <HStack className='gap-3 w-full'>
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
