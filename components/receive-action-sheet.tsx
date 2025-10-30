import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { LayoutDashboard, Plus } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import useBitcoinPrice from "@/hooks/use-bitcoin-price";
import useSettingsStore from "@/stores/settings";
import { useRouter } from "expo-router";
import PosComponent from "./pos";

import { usePaymentAddress } from "@/hooks/use-payment-address";
import useProfileStore from "@/stores/profile";
import { IncomingFunds } from "@arkade-os/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { map, toString } from "lodash";
import QRCode from "react-native-qrcode-skia";
import { match } from "ts-pattern";
import { Heading } from "./ui/heading";
import { Input, InputField } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

import { useTheme } from "@react-navigation/native";
import { Divider } from "./ui/divider";
import { HStack } from "./ui/hstack";

export function ReceiveActionSheet() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const walletAddressMutation = usePaymentAddress();
  const { colors } = useTheme();
  const { wallet } = useProfileStore();
  const { symbol } = useSettingsStore();
  const { data: exchangeRate } = useBitcoinPrice(symbol);

  const [open, setOpen] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);

  const [transaction, setTransaction] = useState<IncomingFunds | undefined>(
    undefined
  );
  const [amountInFiat, setAmountInFiat] = useState<number | undefined>(
    undefined
  );

  const amountInSats = useMemo(() => {
    return exchangeRate?.last
      ? amountInFiat
        ? ((amountInFiat / 100) * 100000000) / exchangeRate.last
        : 0
      : 0;
  }, [amountInFiat, exchangeRate?.last]);

  function backToDashboard() {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    router.replace("/dashboard");
    setOpen(false);
  }

  useEffect(() => {
    if (!wallet) return;
    const stopListening = wallet.notifyIncomingFunds(setTransaction);

    return () => {
      stopListening.then();
    };
  }, [wallet]);

  useEffect(() => {
    walletAddressMutation.mutate(amountInSats);
  }, [amountInSats, showQrCode]);

  useEffect(() => {
    if (open) return;
    walletAddressMutation.reset();
    setShowQrCode(false);
    setAmountInFiat(0);
  }, [open]);

  return (
    <>
      <VStack className='items-center w-max'>
        <Button
          action={"secondary"}
          className='flex-col w-max h-max rounded-full size-14'
          onPress={() => setOpen(true)}
        >
          <ButtonIcon as={Plus} />
        </Button>
        <Text>Receive</Text>
      </VStack>

      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-8'>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          {!showQrCode ? (
            <VStack className='items-center'>
              <Heading>Select amount</Heading>
              <Text>Type an amount or leave empty</Text>
            </VStack>
          ) : transaction ? (
            <VStack className='items-center'>
              <Heading>Payment fulfilled</Heading>
              <Text>You have an incoming transaction</Text>
            </VStack>
          ) : (
            <VStack className='items-center'>
              <Heading>Payment</Heading>
              <Text>Show payment request</Text>
            </VStack>
          )}

          {!showQrCode ? (
            <VStack space={"4xl"}>
              <VStack space={"md"} className='items-end'>
                <HStack className='items-center' space={"sm"}>
                  <Text size='6xl'>
                    {Intl.NumberFormat("it", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    }).format(amountInFiat ? amountInFiat / 100 : 0)}
                  </Text>
                  <Text className='text-primary-500 font-thin text-4xl'>
                    {exchangeRate ? symbol : "SATS"}
                  </Text>
                </HStack>
                <PosComponent
                  value={amountInFiat || 0}
                  onChange={setAmountInFiat}
                />
              </VStack>
              <Divider />
              <VStack space={"md"}>
                <Button onPress={() => setShowQrCode(true)}>
                  <ButtonText>Show QR</ButtonText>
                </Button>
                <Button
                  variant={"link"}
                  action='negative'
                  onPress={() => {
                    setOpen(false);
                    setAmountInFiat(0);
                  }}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
              </VStack>
            </VStack>
          ) : (
            match(walletAddressMutation)
              .with({ isPending: true }, () => (
                <HStack space={"sm"} className='items-center'>
                  <Spinner />
                  <Heading size={"sm"}>Generating QR</Heading>
                </HStack>
              ))
              .with({ isError: true }, () => <Text>Error</Text>)
              .with({ isSuccess: true }, ({ data }) => {
                if (!data) return <Text>No wallet generated</Text>;
                console.log(data);
                return (
                  <VStack space={"xl"} className='w-full'>
                    {!transaction ? (
                      <>
                        <QRCode
                          value={data}
                          size={256}
                          color={colors.text}
                          shapeOptions={{
                            shape: "square",
                            eyePatternShape: "square",
                            eyePatternGap: 0,
                            gap: 0,
                          }}
                        />
                        <Input
                          isDisabled
                          size={"sm"}
                          className='h-max py-3'
                          variant={"underlined"}
                        >
                          <InputField value={data} multiline />
                        </Input>
                        <Button disabled={true} variant={"link"}>
                          <Spinner />
                          <ButtonText>Waiting payment notification</ButtonText>
                        </Button>
                      </>
                    ) : (
                      <>
                        {match(transaction)
                          .with({ type: "utxo" }, (coin) => (
                            <>
                              {map(coin.coins, (newCoin) => (
                                <Input
                                  key={newCoin.txid}
                                  isDisabled
                                  size={"sm"}
                                  className='h-max py-3'
                                  variant={"underlined"}
                                >
                                  <InputField
                                    value={toString(newCoin.txid)}
                                    multiline
                                  />
                                </Input>
                              ))}
                              <Button onPress={backToDashboard}>
                                <ButtonText>Back to dashboard</ButtonText>
                                <ButtonIcon as={LayoutDashboard} />
                              </Button>
                            </>
                          ))
                          .with({ type: "vtxo" }, (coin) =>
                            map(coin.newVtxos, (vtxo) => (
                              <Input
                                key={vtxo.txid}
                                isDisabled
                                size={"sm"}
                                className='h-max py-3'
                                variant={"underlined"}
                              >
                                <InputField
                                  value={toString(vtxo.txid)}
                                  multiline
                                />
                              </Input>
                            ))
                          )
                          .otherwise(() => (
                            <Input
                              isDisabled
                              size={"sm"}
                              className='h-max py-3'
                              variant={"underlined"}
                            >
                              <InputField value={data} multiline />
                            </Input>
                          ))}
                        <Button onPress={backToDashboard}>
                          <ButtonText>Back to dashboard</ButtonText>
                          <ButtonIcon as={LayoutDashboard} />
                        </Button>
                      </>
                    )}
                  </VStack>
                );
              })
              .otherwise(({ status }) => <Text>{status}</Text>)
          )}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
