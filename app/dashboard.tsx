import { AccountsCarousel } from "@/components/accounts-carousel";
import AppLayout from "@/components/layout/app-layout";
import { Transactions } from "@/components/transactions";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import useProfileStore from "@/stores/profile";

import React from "react";

const DashboardPage = () => {
  const { wallet, showTransactionsList } = useProfileStore();

  if (!wallet) return;
  return (
    <AppLayout>
      <AccountsCarousel />
      <VStack className='px-6'>
        {showTransactionsList ? (
          <Transactions />
        ) : (
          <Card>
            <Spinner />
          </Card>
        )}
      </VStack>
    </AppLayout>
  );
};

export default DashboardPage;
