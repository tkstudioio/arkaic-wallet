import AppLayout from "@/components/layout/app";
import { OnchainBalance } from "@/components/onchain-balance";
import { OnchainTransactionsList } from "@/components/onchain-transactions-list";

export default function OnchainPage() {
  return (
    <AppLayout>
      <OnchainBalance />
      <OnchainTransactionsList />
    </AppLayout>
  );
}
