import { AccountBalance } from "@/components/account-balance";
import AppLayout from "@/components/layout/app-layout";
import { Transactions } from "@/components/transactions";
import { Card } from "@/components/ui/card";
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
            <Transactions />
          </VStack>
        ))}
    </AppLayout>
  );
};
export default DashboardPage;
