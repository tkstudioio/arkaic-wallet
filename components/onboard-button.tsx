import { useOnboardUtxos } from "@/hooks/use-onboard-utxos";
import { useQueryClient } from "@tanstack/react-query";
import { PlaneTakeoff } from "lucide-react-native";
import { match } from "ts-pattern";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";

export function OnboardButton() {
  const onboardUtxos = useOnboardUtxos();
  const queryClient = useQueryClient();

  return match(onboardUtxos)
    .with({ isPending: true }, () => <Spinner />)
    .with({ isError: true }, () => <Text>Error onboarding funds</Text>)
    .with({ isSuccess: true }, () => <Text>Funds onboarderd</Text>)
    .with({ isIdle: true }, ({ mutateAsync }) => {
      async function handleOnboard() {
        await mutateAsync(undefined, {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["onchain-transactions"],
            });
            queryClient.invalidateQueries({
              queryKey: ["balance"],
            });
          },
        });
      }
      return (
        <Button
          onPress={handleOnboard}
          action={"secondary"}
          variant={"outline"}
          size={"sm"}
          className='rounded-full'
        >
          <ButtonText>Onboard</ButtonText>
          <ButtonIcon as={PlaneTakeoff} />
        </Button>
      );
    })
    .otherwise(() => null);
}
