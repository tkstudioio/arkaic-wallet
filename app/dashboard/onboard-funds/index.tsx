import AppLayout from "@/components/layout/app";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useBalance } from "@/hooks/use-balance";
import useProfileStore from "@/stores/wallet";
import { ArkTransaction, Ramps } from "@arkade-os/sdk";
import { useTheme } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "expo-router";

import { filter, get, isEmpty, map } from "lodash";
import { match } from "ts-pattern";

export default function OnboardFundsPage() {
  return (
    <AppLayout>
      <WaitingOnboardTransactionsList />
    </AppLayout>
  );
}

function WaitingOnboardTransactionsList() {
  const { colors } = useTheme();
  const router = useRouter();
  const { wallet } = useProfileStore();
  const { data: balance } = useBalance();
  const queryClient = useQueryClient();

  const onboardUtxos = useMutation({
    mutationKey: ["onboard-utxos"],
    mutationFn: async () => {
      if (!wallet) throw new Error("Missing wallet");
      const commitmentTxid = await new Ramps(wallet).onboard();
      return commitmentTxid;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["waiting-onboard-transactions"],
      }),
    onError: (e) => console.log(e),
  });

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
      if (isEmpty(onboardingTransactions)) {
        return <Heading size='xl'>No transactions waiting onboard</Heading>;
      }

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
            <>
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
            </>
          ) : (
            <VStack space={"md"}>
              <Heading className='text-center'>All sats onboarded</Heading>
              <Button
                onPress={() => router.replace("/dashboard")}
                action={"secondary"}
                className='w-max rounded-full mx-auto'
              >
                <ButtonText>Back to dashboard</ButtonText>
              </Button>
            </VStack>
          )}

          {!isEmpty(waitingConfirmation) ? (
            <Card className='gap-6'>
              <Text>Waiting onchain confirmation</Text>

              {map(waitingConfirmation, (transaction) => (
                <HStack className='justify-between items-end'>
                  <VStack>
                    <Text>{format(transaction.createdAt, "HH:mm")}</Text>
                    <Heading size={"xs"}>
                      {format(transaction.createdAt, "dd/MM/yyyy")}
                    </Heading>
                  </VStack>
                  <HStack className='items-end' space='xs'>
                    <Heading>{transaction.amount}</Heading>
                    <Text size='sm'>SATS</Text>
                  </HStack>
                </HStack>
              ))}
            </Card>
          ) : null}
        </VStack>
      );
    })

    .otherwise(() => null);

  // return match(waitingOnboardTransactions)
  //   .with({ isSuccess: true }, ({ data: onboardingTransactions }) => {
  //     if (isEmpty(onboardingTransactions)) {
  //       return (
  //         <View>
  //           <Card className='gap-6' variant='ghost'>
  //             <View>
  //               <View className='flex items-center gap-3'>
  //                 <Heading size='xl'>No transactions waiting onboard</Heading>
  //                 <Button variant='link' onPress={() => router.back()}>
  //                   <ArrowLeft />
  //                   <ButtonText>Go back</ButtonText>
  //                 </Button>
  //               </View>
  //             </View>
  //           </Card>
  //         </View>
  //       );
  //     }

  //     return (
  //       <View>
  //         <Card className='gap-6'>
  //           <View>
  //             <Text>Ready to onboard</Text>
  //             <View className='flex flex-row items-baseline gap-1'>
  //               <Heading size='3xl'>
  //                 {Intl.NumberFormat("it").format(
  //                   get(balance?.boarding, "confirmed", 0)
  //                 )}
  //               </Heading>
  //               <Text>SATS</Text>
  //             </View>
  //           </View>
  //           <Divider />
  //           <View>
  //             <View>
  //               {map(onboardingTransactions, (transaction) => (
  //                 <TransactionRow
  //                   key={transaction.key.boardingTxid}
  //                   transaction={transaction}
  //                 />
  //               ))}
  //             </View>
  //           </View>

  //           {match(onboardUtxos)
  //             .with({ isSuccess: true }, () => <Text>Funds onboarded</Text>)
  //             .with({ isPending: true }, () => <Spinner />)
  //             .with({ isError: true }, () => (
  //               <Text>Error onboarding funds</Text>
  //             ))
  //             .otherwise(({ mutate: onboardUtxos }) => (
  //               <Button onPress={() => onboardUtxos()}>
  //                 <ButtonText>Onboard all funds</ButtonText>
  //               </Button>
  //             ))}
  //         </Card>
  //       </View>
  //     );
  //   })

  //   .with({ isPending: true }, () => <Spinner />)
  //   .with({ isError: true }, () => (
  //     <Text>Error fetching waiting onboard transactions</Text>
  //   ))
  //   .otherwise(() => null);
}
