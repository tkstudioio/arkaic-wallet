import AppLayout from "@/components/layout/app";
import { OnchainBalanceComponent } from "@/components/onchain-balance";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useOnchainTransactions } from "@/hooks/use-transactions/use-onchain-transactions";

import { filter, map } from "lodash";
import { match } from "ts-pattern";
export default function OnboardFundsPage() {
  return (
    <AppLayout>
      <WaitingOnboardTransactionsList />
    </AppLayout>
  );
}

function WaitingOnboardTransactionsList() {
  const onchainTransactionsQuery = useOnchainTransactions();

  return match(onchainTransactionsQuery)
    .with({ isPending: true }, () => <Spinner />)
    .with({ isError: true }, () => (
      <Text>Error fetching waiting onboard transactions</Text>
    ))
    .with({ isSuccess: true }, ({ data: onboardingTransactions }) => {
      const pendingTransactions = filter(
        onboardingTransactions,
        (transaction) => !transaction.createdAt
      );

      return (
        <VStack space={"4xl"}>
          <OnchainBalanceComponent />

          <Card>
            {match(pendingTransactions)
              .with([], () => (
                <Heading className='text-center'>
                  No pending onchain transactions
                </Heading>
              ))
              .otherwise((pendingTransactions) =>
                map(pendingTransactions, (transaction, idx) => (
                  <VStack space={"sm"}>
                    <HStack
                      key={idx}
                      className='justify-between items-center'
                      space={"xl"}
                    >
                      <HStack space='sm'>
                        <Spinner />
                        <Text>waiting confirmations</Text>
                      </HStack>
                      <HStack className='items-end' space='xs'>
                        <Heading>{transaction.amount}</Heading>
                        <Text size='sm'>SATS</Text>
                      </HStack>
                    </HStack>
                    <Input variant={"underlined"} size={"xs"}>
                      <InputField value={transaction.key.boardingTxid} />
                    </Input>
                  </VStack>
                ))
              )}
          </Card>
        </VStack>
      );
    })

    .otherwise(() => null);
}
