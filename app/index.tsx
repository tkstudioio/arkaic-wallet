import { AccountsCarousel } from "@/components/accounts-carousel";
import { ArkaicOperationsList } from "@/components/arkaic-operations-list";
import AppLayout from "@/components/layout/app-layout";
import { VStack } from "@/components/ui/vstack";

import React from "react";

const Home = () => {
  return (
    <AppLayout>
      <AccountsCarousel />

      <VStack className='px-6'>
        <ArkaicOperationsList />
      </VStack>
    </AppLayout>
  );
};

export default Home;
