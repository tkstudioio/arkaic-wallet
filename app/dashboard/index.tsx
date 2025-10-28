import AppLayout from "@/components/layout/app-layout";

import { ArkaicOperationsList } from "@/components/arkaic-operations-list";

import { useRouter } from "expo-router";

import { AccountsCarousel } from "@/components/accounts-carousel";
import { VStack } from "@/components/ui/vstack";
import React from "react";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <AppLayout>
      <AccountsCarousel />

      <VStack className='px-6'>
        <ArkaicOperationsList />
      </VStack>
    </AppLayout>
  );
}
