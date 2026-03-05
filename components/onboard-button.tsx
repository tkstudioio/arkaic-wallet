import { useOnboardUtxos } from "@/hooks/use-onboard-utxos";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, PlaneTakeoff } from "lucide-react-native";
import { PropsWithChildren, useState } from "react";
import { Linking, TouchableOpacity } from "react-native";
import { match } from "ts-pattern";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "./ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Large, P } from "./ui/typography";
import { VStack } from "./ui/vstack";

export function OnboardButton(
  props: PropsWithChildren<{ disabled?: boolean }>,
) {
  const onboardUtxos = useOnboardUtxos();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState<boolean>();

  return (
    <>
      {
        <TouchableOpacity
          onPress={() => setOpen(true)}
          disabled={props.disabled}
        >
          {props.children}
        </TouchableOpacity>
      }
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-8'>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack className='w-full items-center'>
            {match(onboardUtxos)
              .with({ isSuccess: true }, ({ data: commitmentTxid }) => (
                <VStack className='items-center' space={"xl"}>
                  <VStack className='items-center'>
                    <Large>Onboard transaction sent</Large>
                    <P>Check your transaction on mempool.space</P>
                  </VStack>
                  <VStack>
                    <Button
                      variant={"link"}
                      onPress={() =>
                        Linking.openURL(
                          `https://mempool.space/it/tx/${commitmentTxid}`,
                        )
                      }
                    >
                      <ButtonText>Check transaction</ButtonText>
                      <ButtonIcon as={ExternalLink} />
                    </Button>
                    <Button
                      onPress={() => setOpen(false)}
                      variant={"link"}
                      action='secondary'
                    >
                      <ButtonText>Close</ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              ))
              .otherwise(() => (
                <>
                  <Large>Onboard funds</Large>
                  <P>Do you really want to onboard all pending funds?</P>
                </>
              ))}
          </VStack>

          <VStack className='w-full items-center' space='md'>
            {match(onboardUtxos)
              .with({ isPending: true }, () => (
                <Button disabled variant='link' action='secondary'>
                  <ButtonIcon as={Spinner} />
                  <ButtonText>Onboarding funds</ButtonText>
                </Button>
              ))
              .with({ isError: true }, ({ mutate }) => (
                <>
                  <P>Error onboarding funds</P>
                  <Button
                    variant='link'
                    action='negative'
                    onPress={() => mutate(undefined)}
                  >
                    <ButtonText>Retry onboard</ButtonText>
                  </Button>
                </>
              ))
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
                  <Button onPress={handleOnboard}>
                    <ButtonText>Onboard funds</ButtonText>
                    <ButtonIcon as={PlaneTakeoff} />
                  </Button>
                );
              })
              .otherwise(() => null)}
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
