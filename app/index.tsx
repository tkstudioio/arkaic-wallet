import AppLayout from "@/components/layout/app";
import { ProfilesList } from "@/components/profiles-list";
import { VStack } from "@/components/ui/vstack";

import React from "react";

const Home = () => {
  return (
    <AppLayout>
      <VStack space='4xl' className='items-center justify-center h-full'>
        <ProfilesList />
      </VStack>
    </AppLayout>
  );
};

export default Home;
