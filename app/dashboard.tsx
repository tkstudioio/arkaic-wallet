import { AccountBalance } from "@/components/account-balance";
import AppLayout from "@/components/layout/app-layout";
import { ReceiveActionSheet } from "@/components/receive-action-sheet";
import { SendActionSheet } from "@/components/send-action-sheet";
import { Transactions } from "@/components/transactions";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import useProfileStore from "@/stores/profile";

import React from "react";
import { match } from "ts-pattern";

const DashboardPage = () => {
  const { profile } = useProfileStore();

  return (
    <AppLayout>
      {match(profile)
        .with(undefined, () => <Text>Ciro</Text>)
        .otherwise((profile) => (
          <VStack className='px-arkaic-md' space={"4xl"}>
            <Card className='flex-1 w-full aspect-video items-center justify-center'>
              <AccountBalance profile={profile} />
            </Card>
            <HStack space={"xl"} className='justify-center'>
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
