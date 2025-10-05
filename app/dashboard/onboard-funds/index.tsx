import AppLayout from "@/components/layout/app";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useBalance } from "@/hooks/use-balance";
import { useOnboardUtxos } from "@/hooks/use-onboard-utxos";
import useProfileStore from "@/stores/wallet";
import { ArkTransaction } from "@arkade-os/sdk";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { filter, get, isEmpty, map } from "lodash";
import { ArrowLeft } from "lucide-react-native";
import { match } from "ts-pattern";
export default function OnboardFundsPage() {
  return (
    <AppLayout>
      <WaitingOnboardTransactionsList />
    </AppLayout>
  );
}

function WaitingOnboardTransactionsList() {
  const router = useRouter();
  const { wallet } = useProfileStore();
  const { data: balance } = useBalance();

  const onboardUtxos = useOnboardUtxos();

  const waitingOnboardTransactions = useQuery({
    queryKey: ["waiting-onboard-transactions"],
    queryFn: async () => {
      if (!wallet) throw new Error("Missing wallet");
      return filter(await wallet.getTransactionHistory(), (transaction) => {
        if (!transaction.key.boardingTxid) return false;
        return !transaction.settled;
      });
    },
  });

  return match(waitingOnboardTransactions)
    .with({ isPending: true }, () => <Spinner />)
    .with({ isError: true }, () => (
      <Text>Error fetching waiting onboard transactions</Text>
    ))
    .with({ isSuccess: true }, ({ data: onboardingTransactions }) => {
      const waitingOnboard = filter(
        onboardingTransactions,
        (transaction: ArkTransaction) => transaction.settled
      );

      const waitingConfirmation = filter(
        onboardingTransactions,
        (transaction: ArkTransaction) => !transaction.settled
      );

      return (
        <VStack space={"4xl"}>
          {!isEmpty(waitingOnboard) ? (
            <VStack>
              <VStack
                className='items-center aspect-video justify-center'
                space={"sm"}
              >
                <Text>Ready to onboard</Text>
                <HStack className='items-baseline' space={"xs"}>
                  <Heading size={"3xl"}>
                    {Intl.NumberFormat("it").format(
                      get(balance?.boarding, "confirmed", 0)
                    )}
                  </Heading>
                  <Text>SATS</Text>
                </HStack>
              </VStack>

              {match(onboardUtxos)
                .with({ isSuccess: true }, () => (
                  <>
                    <Text>Funds onboarded succesfully!</Text>
                    <Button>
                      <ButtonText></ButtonText>
                    </Button>
                  </>
                ))
                .with({ isPending: true }, () => <Spinner />)
                .with({ isError: true }, () => (
                  <Text>Error onboarding funds</Text>
                ))
                .otherwise(({ mutate: onboardUtxos }) => (
                  <Button onPress={() => onboardUtxos()}>
                    <ButtonText>Onboard all funds</ButtonText>
                  </Button>
                ))}
            </VStack>
          ) : (
            <VStack
              space={"2xl"}
              className='aspect-video justify-center items-center'
            >
              <VStack className='items-center'>
                <Text>No sats confirmed onchain</Text>
                <Heading className='text-center' size={"2xl"}>
                  All sats onboarded
                </Heading>
              </VStack>
              <Button
                onPress={() => router.replace("/dashboard")}
                variant={"outline"}
                className='w-max rounded-full mx-auto'
              >
                <ButtonIcon as={ArrowLeft} />
                <ButtonText>Back to dashboard</ButtonText>
              </Button>
            </VStack>
          )}

          {!isEmpty(waitingConfirmation) && (
            <Card variant={"ghost"}>
              {map(waitingConfirmation, (transaction, idx) => (
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
              ))}
            </Card>
          )}
        </VStack>
      );
    })

    .otherwise(() => null);
}
