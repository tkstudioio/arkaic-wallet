import { useBalance } from "@/hooks/use-balance";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { CircleFadingArrowUp, Sofa } from "lucide-react-native";
import { View } from "react-native";
import { match } from "ts-pattern";
import { Button, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";

export function OnboardSats() {
  const balanceQuery = useBalance();
  const router = useRouter();
  const theme = useTheme();

  return match(balanceQuery)
    .with({ isSuccess: true }, ({ data }) => {
      return (
        <View className='flex flex-row gap-6 items-center mt-6'>
          {data.boarding.confirmed ? (
            <View className='flex flex-row items-center flex-1 gap-2'>
              <Sofa stroke={theme.colors.text} strokeWidth={1} />
              <View className='flex flex-row items-baseline flex-1 gap-2'>
                <Heading size={"2xl"}>
                  {Intl.NumberFormat("it-IT").format(data.boarding.confirmed)}
                </Heading>
                <Text>SATS</Text>
              </View>
            </View>
          ) : (
            <View className='flex flex-row items-center flex-1 gap-4'>
              <Heading size={"md"}>no utxo waiting onboard</Heading>
            </View>
          )}

          {data.boarding.confirmed ? (
            <Button
              variant={"link"}
              action={"secondary"}
              onPress={() => router.push("/dashboard/onboard-funds")}
            >
              <ButtonText>Onboard</ButtonText>
              <CircleFadingArrowUp size={18} stroke={theme.colors.primary} />
            </Button>
          ) : null}
        </View>
      );
    })
    .with({ isError: true }, () => <Text>Error loading balance</Text>)
    .with({ isLoading: true }, { isPending: true }, () => <Spinner />)
    .exhaustive();
}
