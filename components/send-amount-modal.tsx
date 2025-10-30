import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Send, Triangle } from "lucide-react-native";
import React, { useCallback } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useSendBitcoin } from "@/hooks/use-send-bitcoin";

import { useAspInfo } from "@/hooks/use-asp-info";
import { ArkaicPayment } from "@/types/arkaic";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { toNumber } from "lodash";
import { match } from "ts-pattern";
import { AmountComponent } from "./amount";
import PosComponent from "./pos";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
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

      await sendBitcoinMutation.mutateAsync(
        {
          ...props.arkaicPayment,
          amount: props.arkaicPayment.amount || props.amount,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["balance"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          },
        }
      );
    },
    [props.amount, props.arkaicPayment, queryClient, sendBitcoinMutation]
  );

  function changeAmount(amount?: number) {
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
                  <AmountComponent amount={props.arkaicPayment.amount} />
                ) : (
                  <PosComponent
                    onChange={changeAmount}
                    value={props.arkaicPayment?.amount || props.amount}
                  />
                )
              )}
            <VStack className='items-center' space={"sm"}>
              {aspInfo?.signerPubkey === props.arkaicPayment?.signerPubkey &&
              props.arkaicPayment?.arkAddress ? (
                <>
                  <Badge action={"success"} className='gap-1'>
                    <BadgeIcon as={Triangle} />
                    <BadgeText>Ark payment</BadgeText>
                  </Badge>
                  <Text className='text-center' size={"sm"}>
                    {props.arkaicPayment?.arkAddress}
                  </Text>
                </>
              ) : (
                <>
                  <Badge action={"warning"} className='gap-1'>
                    <BadgeIcon as={Triangle} />
                    <BadgeText>Onchain payment</BadgeText>
                  </Badge>
                  <Text className='text-center' size={"sm"}>
                    {props.arkaicPayment?.onchainAddress}
                  </Text>
                </>
              )}
            </VStack>
          </VStack>

          {sendBitcoinMutation.isSuccess ? (
            <Button
              className='w-max'
              onPress={() => router.replace("/dashboard")}
            >
              <ButtonText>Back to dashbooard</ButtonText>
            </Button>
          ) : (
            <VStack className='justify-around'>
              <Button className='w-max' onPress={handleSendBitcoins}>
                <ButtonText>Send</ButtonText>
                <ButtonIcon as={Send} />
              </Button>
              <Button
                className='w-full'
                variant='link'
                action='negative'
                onPress={() => {
                  props.setOpen(false);
                  sendBitcoinMutation.reset();
                }}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
            </VStack>
          )}
        </VStack>
      </ModalContent>
    </Modal>
  );
}
