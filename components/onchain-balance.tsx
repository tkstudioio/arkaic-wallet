import { Text } from "@/components/ui/text";
import { useBalance } from "@/hooks/use-balance";
import { useOnboardUtxos } from "@/hooks/use-onboard-utxos";
import { useRouter } from "expo-router";
import { ExternalLink, PlaneTakeoff } from "lucide-react-native";
import { View } from "react-native";
import { match } from "ts-pattern";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

export function OnchainBalanceComponent() {
  const balanceQuery = useBalance();
  const router = useRouter();
  const onboardUtxos = useOnboardUtxos();

  return (
    <View className='gap-6'>
      {match(balanceQuery)
        .with({ isSuccess: true }, ({ data }) => (
          <Card variant={"ghost"} className={"aspect-video"}>
            <VStack space={"lg"} className='items-center my-auto'>
              {data.boarding.confirmed && <Text>Onchain funds</Text>}

              <HStack className='items-baseline' space={"sm"}>
                <Heading size='4xl'>
                  {data.boarding.confirmed
                    ? Intl.NumberFormat("it-IT").format(data.boarding.confirmed)
                    : "no funds"}
                </Heading>
                {data.boarding.confirmed && <Text>SATS</Text>}
              </HStack>
              {match(onboardUtxos)
                .with({ isPending: true }, () => <Spinner />)
                .with({ isError: true }, () => (
                  <Text>Error onboarding funds</Text>
                ))
                .with({ isSuccess: true }, ({ mutate }) => (
                  <Button
                    onPress={() => router.replace("/dashboard")}
                    variant={"link"}
                    size={"sm"}
                    className='rounded-full'
                  >
                    <ButtonText>Back to dashboard</ButtonText>
                    <ButtonIcon as={ExternalLink} />
                  </Button>
                ))
                .with({ isIdle: true }, ({ mutate }) =>
                  data.boarding.confirmed ? (
                    <Button
                      onPress={() => mutate()}
                      action={"secondary"}
                      variant={"outline"}
                      size={"sm"}
                      className='rounded-full'
                    >
                      <ButtonText>Onboard</ButtonText>
                      <ButtonIcon as={PlaneTakeoff} />
                    </Button>
                  ) : null
                )
                .otherwise(() => null)}
            </VStack>

            <HStack className='justify-around'>{/*  */}</HStack>
          </Card>
        ))
        .with({ isLoading: true }, () => <Spinner />)
        .otherwise(({ error }) => {
          return (
            <View>
              <Heading>Failed to load onchain balance </Heading>
              <Text>{error?.message}</Text>;
            </View>
          );
        })}
    </View>
  );
}
