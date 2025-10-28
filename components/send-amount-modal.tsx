import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Send, Triangle, TriangleAlert, Zap } from "lucide-react-native";
import React, { useCallback } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useSendBitcoin } from "@/hooks/use-send-bitcoin";

import { useAspInfo } from "@/hooks/use-asp-info";
import { ArkaicPayment } from "@/types/arkaic";
import { BitcoinLayer } from "@/types/common";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { toNumber, toString } from "lodash";
import { match } from "ts-pattern";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

export function SendAmountModal(props: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  arkaicPayment?: ArkaicPayment;
  amount: number;
  onAmountChange?: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { data: aspInfo } = useAspInfo();
  const router = useRouter();
  const queryClient = useQueryClient();

  const sendBitcoinMutation = useSendBitcoin();

  const handleSendBitcoins = useCallback(
    async function handleSendBitcoins() {
      if (!props.arkaicPayment) return;

      await sendBitcoinMutation.mutateAsync({
        ...props.arkaicPayment,
        amount: props.arkaicPayment.amount || props.amount,
      });

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["onchain-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["ark-transactions"] });
    },
    [props.amount, props.arkaicPayment, queryClient, sendBitcoinMutation]
  );

  function changeAmount(amount: string) {
    if (!props.onAmountChange) return;
    props.onAmountChange(toNumber(amount));
  }

  return (
    <Modal
      isOpen={props.open}
      onClose={() => {
        props.setOpen(false);
      }}
      size='md'
    >
      <ModalBackdrop />
      <ModalContent>
        <VStack space='2xl'>
          <VStack space={"md"}>
            {match(sendBitcoinMutation)
              .with({ isPending: true }, () => <Spinner />)
              .with({ isError: true }, ({ error }) => (
                <Text>{error.message}</Text>
              ))
              .with({ isSuccess: true }, () => (
                <Heading className='text-center'>Payment sent!</Heading>
              ))
              .otherwise(() =>
                props.arkaicPayment?.amount ? (
                  <HStack
                    className='items-baseline justify-center'
                    space={"sm"}
                  >
                    <Heading size='2xl'>
                      {Intl.NumberFormat("it").format(
                        props.arkaicPayment.amount
                      )}
                    </Heading>
                    <Text>SATS</Text>
                  </HStack>
                ) : (
                  <Input size={"xl"} variant={"underlined"} className='gap-2'>
                    <InputField
                      value={toString(
                        props.arkaicPayment?.amount
                          ? props.arkaicPayment.amount
                          : props.amount
                      )}
                      onChangeText={changeAmount}
                      className='text-right'
                      placeholder='--,00'
                    />
                    <Text>SATS</Text>
                  </Input>
                )
              )}

            {sendBitcoinMutation.isSuccess || !aspInfo?.signerPubkey ? null : (
              <VStack className='items-center'>
                {match(props.arkaicPayment)
                  .with(
                    {
                      layer: BitcoinLayer.Ark,
                      signerPubkey: aspInfo.signerPubkey,
                    },
                    () => (
                      <Badge action={"success"} className='gap-1'>
                        <BadgeIcon as={Triangle} />
                        <BadgeText>Ark payment</BadgeText>
                      </Badge>
                    )
                  )
                  .with({ layer: BitcoinLayer.Lightning }, () => (
                    <Badge action={"info"} className='gap-1'>
                      <BadgeIcon as={Zap} />
                      <BadgeText>Lightning payment</BadgeText>
                    </Badge>
                  ))
                  .otherwise(() => (
                    <Badge className='gap-1' action='warning'>
                      <BadgeText>Onchain payment</BadgeText>
                      <BadgeIcon as={TriangleAlert} />
                    </Badge>
                  ))}
              </VStack>
            )}
          </VStack>
          {sendBitcoinMutation.isSuccess ? null : (
            <Text className='text-center' size={"sm"}>
              {props.arkaicPayment?.address}
            </Text>
          )}

          {sendBitcoinMutation.isSuccess ? (
            <Button onPress={() => router.replace("/dashboard")}>
              <ButtonText>Back to dashbooard</ButtonText>
            </Button>
          ) : (
            <HStack className='justify-around'>
              <Button
                variant='link'
                action='negative'
                onPress={() => {
                  props.setOpen(false);
                  sendBitcoinMutation.reset();
                }}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button onPress={handleSendBitcoins}>
                <ButtonText>Send</ButtonText>
                <ButtonIcon as={Send} />
              </Button>
            </HStack>
          )}
        </VStack>
      </ModalContent>
    </Modal>
  );
}
