import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Camera, QrCode, Send } from "lucide-react-native";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { useAspInfo } from "@/hooks/use-asp-info";
import useBitcoinPrice from "@/hooks/use-bitcoin-price";
import { useSendBitcoin } from "@/hooks/use-send-bitcoin";
import useSettingsStore from "@/stores/settings";
import { parserBIP21Address } from "@/utils/parse-bip21-address";
import { useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View } from "react-native";
import { match } from "ts-pattern";
import { ArkaicPayment } from "../types/arkaic";
import PosComponent from "./pos";
import { Badge, BadgeText } from "./ui/badge";
import { Divider } from "./ui/divider";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

function shortenAddress(address?: string): string {
  if (!address) return "";
  const firstPart = address.substring(0, 8);
  const lastPart = address.substring(address.length - 9, address.length - 1);

  return `${firstPart}...${lastPart}`;
}

export function SendComponent(props: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { symbol } = useSettingsStore();
  const { data: aspInfo } = useAspInfo();

  const [open, setOpen] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);

  const sendBitcoinMutation = useSendBitcoin();
  const { data: exchangeRate } = useBitcoinPrice(symbol);

  const [inputAddress, setInputAddress] = useState("");
  const [permission, requestPermission] = useCameraPermissions();

  const [arkaicPayment, setArkaicPayment] = useState<ArkaicPayment | undefined>(
    undefined
  );
  const [amountInFiat, setAmountInFiat] = useState<number | undefined>(
    undefined
  );

  function onNewAddressInput(address: string): void {
    const payment = parserBIP21Address(address);
    if (!payment) return;

    setArkaicPayment(payment);

    if (payment.amount) {
      setAmount(payment.amount);
    }
  }

  useEffect(() => {
    if (open) return;
    setArkaicPayment(undefined);
    setInputAddress("");
    setAmount(0);
    setAmountInFiat(0);
    sendBitcoinMutation.reset();
  }, [open]);

  const amountInSats = useMemo(() => {
    return exchangeRate?.last
      ? amountInFiat
        ? ((amountInFiat / 100) * 100000000) / exchangeRate.last
        : arkaicPayment?.amount
      : arkaicPayment?.amount
      ? arkaicPayment?.amount
      : 0;
  }, [amountInFiat, exchangeRate?.last, arkaicPayment?.amount]);

  const handleSendBitcoins = useCallback(
    async function handleSendBitcoins() {
      if (!arkaicPayment) return;

      await sendBitcoinMutation.mutateAsync(
        {
          ...arkaicPayment,
          amount: arkaicPayment.amount || amountInSats,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["balance"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          },
        }
      );
    },
    [amountInSats, arkaicPayment, queryClient, sendBitcoinMutation]
  );

  const isIntrapayment = useMemo(
    () =>
      aspInfo?.signerPubkey === arkaicPayment?.signerPubkey &&
      arkaicPayment?.arkAddress,
    [arkaicPayment?.signerPubkey]
  );

  useEffect(() => {
    if (amountInSats) {
      setAmount(amountInSats);
      return;
    }

    setAmount(0);
  }, [amountInSats, arkaicPayment?.amount]);

  useEffect(() => {
    if (!exchangeRate?.last || !arkaicPayment || !arkaicPayment.amount) return;

    setAmountInFiat(
      (arkaicPayment.amount / 100000000) * exchangeRate.last || 0
    );
  }, [arkaicPayment?.amount]);
  return (
    <>
      <VStack className='items-center w-max'>
        <Button
          action={"secondary"}
          className='flex-col w-max h-max rounded-full size-14'
          onPress={() => setOpen(true)}
        >
          <ButtonIcon as={Send} />
        </Button>
        <Text>Send</Text>
      </VStack>
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-8'>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {!permission ? (
            <VStack className='items-center'>
              <Heading>Grant camera access</Heading>
              <Text>Grant camera access to scan a QR.</Text>
            </VStack>
          ) : null}

          {!arkaicPayment
            ? match(permission)
                .with({ granted: false }, () => (
                  <Button
                    variant={"outline"}
                    className='w-96 h-96 mx-auto rounded-xl border-dashed'
                    size={"xl"}
                    onPress={requestPermission}
                  >
                    <ButtonIcon as={Camera} />
                    <ButtonText>Grant camera permissions</ButtonText>
                  </Button>
                ))
                .otherwise(() => {
                  if (!scanning)
                    return (
                      <Button
                        variant='outline'
                        className='w-96 h-96 mx-auto rounded-xl border-dashed'
                        size={"xl"}
                        onPress={() => setScanning(true)}
                      >
                        <ButtonIcon as={QrCode} />
                        <ButtonText>Tap to scan</ButtonText>
                      </Button>
                    );

                  return (
                    <>
                      <View className='w-96 h-96 aspect-square mx-auto rounded-lg overflow-hidden'>
                        <CameraView
                          style={{ flex: 1 }}
                          facing='back'
                          onBarcodeScanned={({ data }) =>
                            onNewAddressInput(data)
                          }
                        />
                      </View>
                      <Button
                        action={"negative"}
                        variant={"link"}
                        onPress={() => setScanning(false)}
                      >
                        <ButtonText>Stop scanning</ButtonText>
                      </Button>
                    </>
                  );
                })
            : null}

          {!arkaicPayment ? (
            <VStack space={"xl"}>
              <Text className='text-center'>or enter manually</Text>
              <Input size={"xl"} variant={"underlined"}>
                <InputField
                  multiline
                  placeholder='paste bp1... / tark1... / ln...'
                  value={inputAddress}
                  onChangeText={setInputAddress}
                />
              </Input>
              <Button
                variant={"outline"}
                onPress={() => onNewAddressInput(inputAddress)}
              >
                <ButtonText>Continue</ButtonText>
              </Button>
            </VStack>
          ) : null}

          {arkaicPayment ? (
            <VStack className='items-center' space={"2xl"}>
              <VStack className='items-center' space={"sm"}>
                <Heading>Sending to:</Heading>
                <Text className='text-center'>
                  {isIntrapayment
                    ? shortenAddress(arkaicPayment.arkAddress)
                    : shortenAddress(arkaicPayment.onchainAddress)}
                </Text>
                <Badge action={isIntrapayment ? "success" : "warning"}>
                  <BadgeText>
                    {isIntrapayment ? "Ark payment" : "Onchain payment"}
                  </BadgeText>
                </Badge>
              </VStack>
              <Divider />

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

              {match(sendBitcoinMutation)
                .with({ isPending: true }, () => <Spinner />)
                .with({ isError: true }, ({ error }) => (
                  <Text>{error.message}</Text>
                ))
                .with({ isSuccess: true }, () => (
                  <VStack>
                    <Heading className='text-center'>Payment sent!</Heading>
                    <Button
                      className='w-full'
                      variant='link'
                      onPress={() => {
                        setOpen(false);
                        sendBitcoinMutation.reset();
                      }}
                    >
                      <ButtonText>Back to dashbooard</ButtonText>
                    </Button>
                  </VStack>
                ))
                .otherwise(() => (
                  <VStack space='4xl'>
                    {arkaicPayment?.amount ? null : (
                      <PosComponent
                        onChange={(value) => {
                          setAmountInFiat(value || 0);
                        }}
                        value={amountInFiat || 0}
                      />
                    )}
                    <Divider />
                    <VStack space={"md"}>
                      <Button className='w-max' onPress={handleSendBitcoins}>
                        <ButtonText>Send</ButtonText>
                        <ButtonIcon as={Send} />
                      </Button>
                      <Button
                        className='w-full'
                        variant='link'
                        action='negative'
                        onPress={() => {
                          setOpen(false);
                          sendBitcoinMutation.reset();
                        }}
                      >
                        <ButtonText>Cancel</ButtonText>
                      </Button>
                    </VStack>
                  </VStack>
                ))}
            </VStack>
          ) : null}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}

// bitcoin:bc1psmhdceakdcxxygqwjqxv062zevjgnzv25v4fqyrm0cdtaychc4ssamen2j?ark=ark1qq4hfssprtcgnjzf8qlw2f78yvjau5kldfugg29k34y7j96q2w4t5r4tpu65zlvfj8s2p2txsutxvnmze9aygrrunldseyylrsxv2r2jdmqczu&signerPubkey=022b74c2011af089c849383ee527c72325de52df6a788428b68d49e9174053aaba&amount=0.00000528
