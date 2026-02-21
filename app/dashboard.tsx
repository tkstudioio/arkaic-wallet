import { AccountBalance } from "@/components/account-balance";
import AppLayout from "@/components/layout/app-layout";
import { Transactions } from "@/components/transactions";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import useProfileStore from "@/stores/profile";

import React from "react";

const DashboardPage = () => {
  const { profile } = useProfileStore();

  return (
    <AppLayout>
      <Card variant={"ghost"} className='flex-1'>
        <VStack className='items-center my-auto' space={"lg"}>
          {profile ? <AccountBalance profile={profile} /> : <Spinner />}
        </VStack>
      </Card>
      <VStack className='px-6'>
        <Transactions />
      </VStack>
    </AppLayout>
  );
};

export default DashboardPage;
