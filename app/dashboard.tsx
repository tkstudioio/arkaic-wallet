import { AccountsCarousel } from "@/components/accounts-carousel";
import AppLayout from "@/components/layout/app-layout";
import { Transactions } from "@/components/transactions";
import { VStack } from "@/components/ui/vstack";
import useProfileStore from "@/stores/profile";

import React from "react";

const DashboardPage = () => {
  const { wallet, showTransactionsList } = useProfileStore();

  return (
    <AppLayout>
      {wallet ? <AccountsCarousel /> : null}

      {showTransactionsList && wallet ? (
        <VStack className='px-6'>
          <Transactions />
        </VStack>
      ) : null}
    </AppLayout>
  );
};

export default DashboardPage;
