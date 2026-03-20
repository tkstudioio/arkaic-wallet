import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Camera, ClipboardPaste, QrCode, Send } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { useAspInfo } from "@/hooks/use-asp-info";
import { usePasteFromClipboard } from "@/hooks/use-clipboard";
import { useSendBitcoin } from "@/hooks/wallet/use-send-bitcoin";
import { parserBIP21Address } from "@/utils/parse-bip21-address";
import { shortenAddress } from "@/utils/shorten-address";
import { useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View } from "react-native";
import { match } from "ts-pattern";
import { ArkaicPayment } from "../types/arkaic";

import { AmountComponent } from "./amount";
import PosComponent from "./pos";
import { Badge, BadgeText } from "./ui/badge";
import { Divider } from "./ui/divider";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Large, P } from "./ui/typography";
import { VStack } from "./ui/vstack";

export function SendActionSheet() {
  const queryClient = useQueryClient();
  const sendBitcoinMutation = useSendBitcoin();
  const { data: aspInfo } = useAspInfo();
  const { data: pastedData, mutate: pasteFromClipboard } =
    usePasteFromClipboard();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [arkaicPayment, setArkaicPayment] = useState<ArkaicPayment | undefined>(
    undefined,
  );

  const [posValue, setPosValue] = useState<number>(0);

  const isIntrapayment = useMemo(
    () =>
      aspInfo?.signerPubkey === arkaicPayment?.signerPubkey &&
      arkaicPayment?.arkAddress,
    [
      aspInfo?.signerPubkey,
      arkaicPayment?.signerPubkey,
      arkaicPayment?.arkAddress,
    ],
  );

  const handleSendBitcoins = useCallback(
    async function handleSendBitcoins() {
      if (!arkaicPayment) return;

      await sendBitcoinMutation.mutateAsync(
        {
          ...arkaicPayment,
          amount: arkaicPayment.amount || posValue,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["balance"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          },
        },
      );
    },
    [posValue, arkaicPayment, queryClient, sendBitcoinMutation],
  );

  function onNewAddressInput(address: string): void {
    const parsedArkaicPayment = parserBIP21Address(address);
    if (!parsedArkaicPayment) {
      clean();
      return;
    }

    setArkaicPayment(parsedArkaicPayment);

    if (parsedArkaicPayment.amount) {
      setPosValue(parsedArkaicPayment.amount);
    }
  }

  function clean() {
    setArkaicPayment(undefined);
    setPosValue(0);
    sendBitcoinMutation.reset();
  }

  useEffect(() => {
    if (!open) {
      clean();
    }
  }, [open]);

  return (
    <>
      <Button variant={"outline"} onPress={() => setOpen(true)}>
        <ButtonIcon as={Send} />
        <ButtonText>Send</ButtonText>
      </Button>
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className='gap-4'>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {arkaicPayment ? (
            <>
              <Badge action={isIntrapayment ? "success" : "warning"}>
                <BadgeText>
                  {isIntrapayment ? "Ark payment" : "Onchain payment"}
                </BadgeText>
              </Badge>
              <AmountComponent amount={posValue} size='6xl' />
              <Divider />
            </>
          ) : (
            <VStack className='items-center'>
              <Large>Pay an invoice</Large>
              <P>Scan a QR or paste the invoice</P>
            </VStack>
          )}
          {match(sendBitcoinMutation)
            .with({ isSuccess: true }, () => (
              <>
                <VStack className='items-center'>
                  <Large>Payment sent!</Large>
                </VStack>
                <P className='text-center'>
                  {arkaicPayment
                    ? isIntrapayment
                      ? shortenAddress(arkaicPayment.arkAddress)
                      : shortenAddress(arkaicPayment.onchainAddress)
                    : null}
                </P>
              </>
            ))
            .otherwise(() => (
              <>
                {!permission ? (
                  <VStack className='items-center'>
                    <Large>Grant camera access</Large>
                    <P>Grant camera access to scan a QR.</P>
                  </VStack>
                ) : null}

                {!arkaicPayment
                  ? match(permission)
                      .with({ granted: false }, () => (
                        <Button
                          variant={"outline"}
                          className='w-96 h-96 mx-auto rounded-xl border-dashed'
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
                              variant={"outline"}
                              action={"primary"}
                              className='w-full aspect-square '
                              onPress={() => setScanning(true)}
                            >
                              <ButtonIcon as={QrCode} />
                              <ButtonText>Tap to scan</ButtonText>
                            </Button>
                          );

                        return (
                          <>
                            <View className='w-full aspect-square'>
                              <CameraView
                                style={{ flex: 1 }}
                                facing='back'
                                onBarcodeScanned={({ data }) =>
                                  onNewAddressInput(data)
                                }
                              />
                            </View>
                          </>
                        );
                      })
                  : null}

                {!arkaicPayment ? (
                  <Button
                    action={"neutral"}
                    variant={"outline"}
                    onPress={() => {
                      setScanning(false);
                      pasteFromClipboard(undefined, {
                        onSuccess: onNewAddressInput,
                      });
                    }}
                  >
                    <ButtonText>Paste from clipboard</ButtonText>
                    <ButtonIcon as={ClipboardPaste} />
                  </Button>
                ) : null}

                {arkaicPayment ? (
                  <VStack className='items-center' space={"2xl"}>
                    <HStack
                      className='items-between justify-between w-full'
                      space={"sm"}
                    >
                      <Large>Sending to:</Large>
                      <P className='text-center'>
                        {isIntrapayment
                          ? shortenAddress(arkaicPayment.arkAddress)
                          : arkaicPayment.lightningInvoice
                            ? shortenAddress(arkaicPayment.lightningInvoice)
                            : shortenAddress(arkaicPayment.onchainAddress)}
                      </P>
                    </HStack>

                    {match(sendBitcoinMutation)
                      .with({ isPending: true }, () => <Spinner />)
                      .with({ isError: true }, ({ error }) => (
                        <P>{error.message}</P>
                      ))
                      .with({ isSuccess: true }, () => (
                        <Button
                          className='w-full'
                          variant='link'
                          onPress={() => {
                            setOpen(false);
                            sendBitcoinMutation.reset();
                          }}
                        >
                          <ButtonText>Back to dashboard</ButtonText>
                        </Button>
                      ))
                      .otherwise(() => (
                        <VStack space='4xl'>
                          {arkaicPayment?.amount ? null : (
                            <PosComponent
                              value={posValue}
                              onChange={(value) => setPosValue(value || 0)}
                            />
                          )}

                          <VStack space={"md"}>
                            <Button
                              className='w-max'
                              onPress={handleSendBitcoins}
                            >
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
              </>
            ))}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
