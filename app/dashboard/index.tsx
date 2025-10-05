import { ArkBalance } from "@/components/ark-balance";
import AppLayout from "@/components/layout/app";

import { TransactionsHistory } from "@/components/transactions-history";
import React from "react";

export default function DashboardPage() {
  return (
    <AppLayout>
      <ArkBalance />
      <TransactionsHistory />
    </AppLayout>
  );
}
