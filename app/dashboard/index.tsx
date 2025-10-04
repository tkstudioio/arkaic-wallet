import { BalanceComponent } from "@/components/balance";
import AppLayout from "@/components/layout/app";

import { TransactionsHistory } from "@/components/transactions-history";
import React from "react";

export default function DashboardPage() {
  return (
    <AppLayout>
      <BalanceComponent />
      <TransactionsHistory />
    </AppLayout>
  );
}
